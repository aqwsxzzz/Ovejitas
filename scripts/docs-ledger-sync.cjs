#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = process.cwd();
const sourceDocsDir = path.resolve(repoRoot, "../Ovejitas-api/docs");
const targetDocsDir = path.resolve(repoRoot, "backend-docs");
const promptTemplatePath = path.resolve(
	repoRoot,
	".github/prompts/ledger-rules-sync.prompt.md"
);
const handoffPath = path.resolve(
	repoRoot,
	"docs/backend-event-ledger-sync-handoff.md"
);
const ledgerImpactPattern =
	/(event|ledger|action|inventory|acquisition|mortality|reproductive|harvest|material|asset|individual|income|expense)/i;

const run = (cmd, args, options = {}) => {
	const result = spawnSync(cmd, args, {
		cwd: repoRoot,
		stdio: "pipe",
		encoding: "utf-8",
		...options,
	});

	if (result.error) {
		return { ok: false, stdout: "", stderr: result.error.message };
	}

	return {
		ok: result.status === 0,
		stdout: result.stdout?.trim() ?? "",
		stderr: result.stderr?.trim() ?? "",
	};
};

const copyDocs = () => {
	if (!fs.existsSync(sourceDocsDir)) {
		console.error(
			`[docs:ledger] Source docs folder not found: ${sourceDocsDir}`
		);
		process.exit(1);
	}

	fs.cpSync(sourceDocsDir, targetDocsDir, { recursive: true, force: true });
};

const getBackendRevision = () => {
	const result = run("git", ["-C", path.resolve(repoRoot, "../Ovejitas-api"), "rev-parse", "--short", "HEAD"]);
	return result.ok && result.stdout ? result.stdout : "unknown";
};

const listTopLevelBackendDocs = () => {
	if (!fs.existsSync(targetDocsDir)) {
		return [];
	}

	return fs
		.readdirSync(targetDocsDir, { withFileTypes: true })
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name)
		.sort();
};

const getBackendDocsDiff = () => {
	const result = run("git", ["diff", "--numstat", "--", "backend-docs"]);

	if (!result.ok || !result.stdout) {
		return [];
	}

	return result.stdout
		.split("\n")
		.filter((line) => Boolean(line.trim()))
		.map((line) => {
			const [addedRaw, deletedRaw, file] = line.split("\t");
			const added = Number.parseInt(addedRaw, 10);
			const deleted = Number.parseInt(deletedRaw, 10);

			return {
				file,
				added: Number.isNaN(added) ? 0 : added,
				deleted: Number.isNaN(deleted) ? 0 : deleted,
			};
		});
};

const formatDiffList = (entries) => {
	if (entries.length === 0) {
		return "- none";
	}

	return entries
		.slice(0, 20)
		.map((entry) => `- \`${entry.file}\` (+${entry.added} / -${entry.deleted})`)
		.join("\n");
};

const writeHandoff = (backendRevision, topFiles, diffEntries) => {
	const date = new Date().toISOString().slice(0, 10);
	const filesLine =
		topFiles.length > 0
			? topFiles.map((name) => `\`${name}\``).join(", ")
			: "none detected";
	const likelyLedgerImpact = diffEntries.filter((entry) =>
		ledgerImpactPattern.test(entry.file)
	);
	const summaryLine =
		diffEntries.length > 0
			? `Detected ${diffEntries.length} changed backend docs file(s) in this sync.`
			: "No local changes detected in backend-docs after sync.";

	const content = `# Ledger Rules Sync Handoff

Use this file as the ready context payload when running the prompt in \`.github/prompts/ledger-rules-sync.prompt.md\`.

## Context
- Date: ${date}
- Frontend repo: Ovejitas
- Backend source revision: ${backendRevision}
- Sync command used: npm run docs:ledger
- Primary source files in \`backend-docs/\`: ${filesLine}
- Additional source files in \`temp_repo/docs/\`: [fill if needed]

## Detected backend-docs changes
${summaryLine}

### Changed files (up to 20)
${formatDiffList(diffEntries)}

### Likely ledger-impacting files
${formatDiffList(likelyLedgerImpact)}

## Next action
1. Open \`.github/prompts/ledger-rules-sync.prompt.md\`.
2. Copy this context block into the prompt placeholders.
3. Run the prompt with Copilot Chat to update \`docs/backend-event-ledger-rules.md\`.
`;

	fs.writeFileSync(handoffPath, content, "utf-8");
};

const openInCode = () => {
	if (!fs.existsSync(promptTemplatePath)) {
		console.warn(
			`[docs:ledger] Prompt template not found: ${promptTemplatePath}`
		);
		return;
	}

	// Open both files in the current VS Code window for immediate prompt execution.
	run("code", ["-r", promptTemplatePath, handoffPath]);
};

copyDocs();
const backendRevision = getBackendRevision();
const topFiles = listTopLevelBackendDocs();
const diffEntries = getBackendDocsDiff();
writeHandoff(backendRevision, topFiles, diffEntries);
openInCode();

console.log("[docs:ledger] backend-docs synchronized.");
console.log(`[docs:ledger] Handoff file generated: ${path.relative(repoRoot, handoffPath)}`);
console.log("[docs:ledger] Prompt template opened in VS Code.");
console.log("[docs:ledger] Final step is still manual: run the prompt in Copilot Chat.");
