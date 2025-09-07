const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const protoRoot = './src/proto';

const protoDirs = fs
  .readdirSync(protoRoot)
  .filter(file => {
    return fs.statSync(path.join(protoRoot, file)).isDirectory();
  })
  .map(dir => path.join(protoRoot, dir));

const ensureDirSync = dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const protoFiles = protoDirs
  .map(dir => {
    const files = fs.readdirSync(dir).filter(file => file.endsWith('.proto'));
    return files.map(file => ({
      dir,
      file: path.join(dir, file),
    }));
  })
  .flat();

if (protoFiles.length === 0) {
  console.error('No proto files found.');
  process.exit(1);
}

// ts-proto plugin 경로
const pluginTsProto = path.resolve(
  '../../node_modules/.bin/protoc-gen-ts_proto' +
    (process.platform === 'win32' ? '.cmd' : ''),
);

const generateCommands = protoFiles
  .map(({ dir, file }) => {
    const outputDir = path.join('./src/lib', path.basename(dir));
    ensureDirSync(outputDir);

    const protoPath = `--proto_path=${dir}`;
    const tsProtoOut = `--ts_proto_out=${outputDir}`;
    // const tsProtoOpts = `--ts_proto_opt=outputServices=grpc-js,esModuleInterop=true,forceLong=number,useOptionals=messages,useOptionalFields=false`;
    const tsProtoOpts = [
      '--ts_proto_opt=outputServices=grpc-js',
      'esModuleInterop=true',
      'forceLong=number',
      'useOptionals=messages',
      'useOptionalFields=false',
    ].join(',');

    return [
      `protoc ${tsProtoOut} ${tsProtoOpts} --plugin=protoc-gen-ts_proto=${pluginTsProto} ${protoPath} ${file}`,
    ];
  })
  .flat();

try {
  generateCommands.forEach(command => execSync(command, { stdio: 'inherit' }));
  console.log('TypeScript files generated successfully using ts-proto.');

  // Generate src/index.ts
  const indexPath = path.resolve(__dirname, 'src', 'index.ts');
  const importStatements = [];
  const exportObjects = {};

  protoDirs.forEach((dir, dirIndex) => {
    const outputDir = path.join('./src/lib', path.basename(dir));
    const dirName = path.basename(dir);
    exportObjects[dirName] = [];

    const files = fs
      .readdirSync(outputDir)
      .filter(file => file.endsWith('.js') || file.endsWith('.ts'));

    files.forEach((file, fileIndex) => {
      if (!file.endsWith('.d.ts')) {
        const filePath = path.join(outputDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        if (fileContent.trim()) {
          let relativePath = path
            .relative(path.resolve(__dirname, 'src'), filePath)
            .replace(/\\/g, '/');

          // Remove the '.ts' extension only from the import statement
          if (relativePath.endsWith('.ts')) {
            relativePath = relativePath.slice(0, -3);
          }

          const variableName = `${dirName}Module${fileIndex}`;
          importStatements.push(
            `import * as ${variableName} from './${relativePath}';`,
          );
          exportObjects[dirName].push(variableName);
        }
      }
    });
  });

  const exportContent = Object.keys(exportObjects)
    .map(dirName => {
      return `export const ${dirName} = {\n  ${exportObjects[dirName].join(',\n  ')},\n};`;
    })
    .join('\n\n');

  const indexContent =
    `
${importStatements.join('\n')}

${exportContent}
`.trim() + '\n';

  fs.writeFileSync(indexPath, indexContent, 'utf-8');
  console.log(`Generated ${indexPath}`);
} catch (error) {
  console.error('Error generating TypeScript files:', error.message);
  process.exit(1);
}
