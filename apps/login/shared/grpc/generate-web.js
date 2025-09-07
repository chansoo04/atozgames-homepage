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

const generateCommands = protoFiles
  .map(({ dir, file }) => {
    const outputDir = path.join('./src/lib/web', path.basename(dir));
    ensureDirSync(outputDir);

    // DIR=/Users/yeastudio11/develop/github/atoz/gp-api-servers/shared/grpc/src/proto/item
    // OUT_DIR=/Users/yeastudio11/develop/github/atoz/gp-api-servers/shared/grpc/src/lib/web/item
    // ITEM=/Users/yeastudio11/develop/github/atoz/gp-api-servers/shared/grpc/src/proto/item/item.proto

    // protoc \
    // --proto_path=$DIR \
    // --js_out=import_style=commonjs,binary:$OUT_DIR \
    // --grpc-web_out=import_style=commonjs,mode=grpcwebtext:$OUT_DIR \
    // $ITEM

    const protoPath = `--proto_path=${dir}`;
    const tsProtoOut = `--ts_proto_out=${outputDir}`;
    const jsProtoOut = `--js_out=import_style=commonjs,binary:${outputDir}`;
    // const protoOpts = `--grpc-web_out=import_style=commonjs+dts,mode=grpcwebtext:${outputDir}`;
    const protoOpts = `--grpc-web_out=import_style=commonjs,mode=grpcwebtext:${outputDir}`;

    return [
      // `protoc ${protoPath} ${jsProtoOut} ${jsProtoOut} ${protoOpts} ${file}`,
      `protoc ${protoPath} ${jsProtoOut} ${protoOpts} ${file}`,
      // `protoc ${protoPath} ${tsProtoOut} ${protoOpts} ${file}`,
    ];
  })
  .flat();

try {
  generateCommands.forEach(command => execSync(command, { stdio: 'inherit' }));
  console.log('JavaScript files generated successfully grpc-web.');
} catch (error) {
  console.error('Error generating JavaScript files:', error.message);
  process.exit(1);
}
