import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const workflowPath = '.github/workflows/daily-catalog-update.md';
const source = readFileSync(workflowPath, 'utf8');
const frontmatter = source.match(/^---\r?\n([\s\S]+?)\r?\n---(?:\r?\n|$)/u)?.[1];
if (!frontmatter) throw new Error(`${workflowPath}: YAML frontmatter is required.`);
const policy: unknown = parse(frontmatter);

const allowedFiles = [
  'src/data/app.ts',
  'src/data/cli.ts',
  'src/data/ide.ts',
  'src/data/environments.ts',
  'src/data/sources.ts',
];

function object(value: unknown): Record<string, unknown> {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'Expected an object');
  return value as Record<string, unknown>;
}

function assertApprovalPolicy(value: unknown): void {
  const workflow = object(value);
  const triggers = object(workflow.on);
  assert.deepEqual(Object.keys(triggers).sort(), [
    'schedule',
    'skip-if-match',
    'workflow_dispatch',
  ]);
  assert.deepEqual(triggers.schedule, [{ cron: '37 21 * * *' }]);
  assert.equal(
    triggers['skip-if-match'],
    'is:pr is:open in:body "gh-aw-workflow-id: daily-catalog-update"',
  );
  assert.equal(workflow.if, "github.ref == 'refs/heads/main'");
  assert.deepEqual(workflow.permissions, { contents: 'read', 'pull-requests': 'read' });
  assert.deepEqual(workflow.concurrency, {
    group: 'daily-catalog-update',
    'cancel-in-progress': false,
  });
  const outputs = object(workflow['safe-outputs']);
  assert.deepEqual(Object.keys(outputs).sort(), [
    'create-pull-request',
    'github-token',
    'report-failed-jobs',
    'report-failure-as-issue',
  ]);
  assert.equal(outputs['github-token'], '${{ secrets.GITHUB_TOKEN }}');
  assert.equal(outputs['report-failure-as-issue'], false);
  assert.equal(outputs['report-failed-jobs'], false);
  const pullRequest = object(outputs['create-pull-request']);
  assert.equal(pullRequest.draft, true);
  assert.equal(pullRequest.max, 1);
  assert.equal(pullRequest['base-branch'], 'main');
  assert.equal(pullRequest.stacked, false);
  assert.equal(pullRequest['fallback-as-issue'], false);
  assert.equal(pullRequest['if-no-changes'], 'error');
  assert.equal(pullRequest['protected-files'], 'blocked');
  assert.deepEqual(pullRequest['allowed-files'], allowedFiles);
  assert.equal(pullRequest['max-patch-files'], allowedFiles.length);
}

describe('daily update approval boundary', () => {
  it.each([
    [
      'write-enabled agent',
      (value: Record<string, unknown>) => {
        value.permissions = { contents: 'write', 'pull-requests': 'read' };
      },
    ],
    [
      'untrusted PR trigger',
      (value: Record<string, unknown>) => {
        object(value.on).pull_request_target = {};
      },
    ],
    [
      'missing main guard',
      (value: Record<string, unknown>) => {
        delete value.if;
      },
    ],
    [
      'automatic merge',
      (value: Record<string, unknown>) => {
        object(value['safe-outputs'])['merge-pull-request'] = {};
      },
    ],
    [
      'automatic workflow approval',
      (value: Record<string, unknown>) => {
        object(value['safe-outputs'])['approve-workflow-run'] = {};
      },
    ],
    [
      'non-draft PR',
      (value: Record<string, unknown>) => {
        object(object(value['safe-outputs'])['create-pull-request']).draft = false;
      },
    ],
    [
      'unrestricted file writes',
      (value: Record<string, unknown>) => {
        object(object(value['safe-outputs'])['create-pull-request'])['allowed-files'] = ['**'];
      },
    ],
    [
      'inference credential used to push',
      (value: Record<string, unknown>) => {
        object(value['safe-outputs'])['github-token'] = '${{ secrets.COPILOT_GITHUB_TOKEN }}';
      },
    ],
  ] as const)('rejects a broken fixture: %s', (_name, mutate) => {
    const broken = object(structuredClone(policy));
    mutate(broken);
    expect(() => assertApprovalPolicy(broken)).toThrow();
  });

  describe('compiled daily workflow', () => {
    const compiled: unknown = parse(
      readFileSync('.github/workflows/daily-catalog-update.lock.yml', 'utf8'),
    );
    const workflow = object(compiled);
    const jobs = object(workflow.jobs);

    it('emits only schedule and manual triggers with the documented daily time', () => {
      const triggers = object(workflow.on);
      expect(Object.keys(triggers).sort()).toEqual(['schedule', 'workflow_dispatch']);
      expect(triggers.schedule).toEqual([{ cron: '37 21 * * *' }]);
    });

    it('limits writes to the approved PR and reporting helpers, never deployment', () => {
      console.info(
        'Compiled workflow permission coverage:',
        Object.fromEntries(
          Object.entries(jobs).map(([name, value]) => [name, object(value).permissions]),
        ),
      );
      for (const [name, value] of Object.entries(jobs)) {
        const job = object(value);
        const declared = job.permissions ?? workflow.permissions;
        const permissions = declared === 'read-all' ? { all: 'read' } : object(declared);
        for (const [permission, access] of Object.entries(permissions)) {
          if (access === 'write') {
            expect(['safe_outputs', 'conclusion']).toContain(name);
            expect(['contents', 'issues', 'pull-requests']).toContain(permission);
          }
        }
        expect(permissions.pages).toBeUndefined();
        expect(permissions['id-token']).toBeUndefined();
      }
      expect(object(object(jobs.safe_outputs).permissions)).toMatchObject({
        contents: 'write',
        'pull-requests': 'write',
      });
      expect(object(object(jobs.agent).permissions).contents).toBe('read');
    });

    it('persists only the short-lived token in the approved PR helper checkout', () => {
      let checkouts = 0;
      for (const [name, value] of Object.entries(jobs)) {
        const job = object(value);
        assert.ok(Array.isArray(job.steps));
        for (const value of job.steps) {
          const step = object(value);
          if (typeof step.uses === 'string' && step.uses.startsWith('actions/checkout@')) {
            expect(object(step.with)['persist-credentials']).toBe(name === 'safe_outputs');
            checkouts += 1;
          }
        }
      }
      expect(checkouts).toBe(4);
    });

    it('preserves the data-only Draft PR policy in the generated handler configuration', () => {
      const job = object(jobs.safe_outputs);
      assert.ok(Array.isArray(job.steps), 'safe_outputs must contain executable steps');
      const configs = job.steps.flatMap((step: unknown) => {
        const env = object(step).env;
        if (!env) return [];
        const config = object(env).GH_AW_SAFE_OUTPUTS_HANDLER_CONFIG;
        return typeof config === 'string' ? [object(JSON.parse(config))] : [];
      });
      expect(configs).toHaveLength(1);
      const config = configs[0];
      assert.ok(config);
      const pullRequest = object(config.create_pull_request);
      expect(pullRequest).toMatchObject({
        allowed_files: allowedFiles,
        base_branch: 'main',
        draft: true,
        max: 1,
        fallback_as_issue: false,
        if_no_changes: 'error',
        protected_files_policy: 'blocked',
      });
      expect(config.merge_pull_request).toBeUndefined();
      expect(config.approve_workflow_run).toBeUndefined();
      expect(config.dispatch_workflow).toBeUndefined();
    });

    it('pins all compiled action references to immutable commits', () => {
      let actions = 0;
      for (const value of Object.values(jobs)) {
        const job = object(value);
        assert.ok(Array.isArray(job.steps));
        for (const value of job.steps) {
          const step = object(value);
          if (step.uses) {
            expect(step.uses).toMatch(/^[\w./-]+@[a-f0-9]{40}$/u);
            actions += 1;
          }
        }
      }
      expect(actions).toBeGreaterThan(0);
    });
  });

  it('limits scheduled updates to one human-reviewed data-only Draft PR', () => {
    expect(() => assertApprovalPolicy(policy)).not.toThrow();
  });

  it('keeps setup deterministic and grants the existing quality gates to the agent', () => {
    const workflow = object(policy);
    expect(workflow.engine).toEqual({ id: 'copilot', version: '1.0.86' });
    expect(workflow['timeout-minutes']).toBe(25);
    expect(workflow['max-turns']).toBe(120);
    expect(object(workflow.tools).bash).toEqual(
      expect.arrayContaining(['npm run check', 'npm run test:e2e']),
    );
    expect(workflow.steps).toEqual([
      {
        name: 'Set up Node.js',
        uses: 'actions/setup-node@249970729cb0ef3589644e2896645e5dc5ba9c38',
        with: { 'node-version': 22, cache: 'npm' },
      },
      { name: 'Install locked dependencies', run: 'npm ci' },
      {
        name: 'Install test browsers',
        run: 'npx playwright install --with-deps chromium firefox',
      },
    ]);
  });
});
