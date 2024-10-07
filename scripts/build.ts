const {
    outputs: [worker],
    success: buildWorkerSuccess,
    logs: buildWorkerLogs,
} = await Bun.build({
    entrypoints: ['./src/worker.ts'],
    minify: true,
});

if (!buildWorkerSuccess) {
    throw new AggregateError(buildWorkerLogs, "Failed to build 'worker.ts'");
}

const {
    outputs: [index],
    success: buildIndexSuccess,
    logs: buildIndexLogs,
} = await Bun.build({
    entrypoints: ['./src/index.ts'],
    define: {
        workerSource: JSON.stringify(await worker.text()),
    },
});

if (!buildIndexSuccess) {
    throw new AggregateError(buildIndexLogs, "Failed to build 'index.ts'");
}

Bun.write('./dist/inject-jyutping.user.js', `${await Bun.file('header.js').text()}\n${await index.text()}`);

export {};
