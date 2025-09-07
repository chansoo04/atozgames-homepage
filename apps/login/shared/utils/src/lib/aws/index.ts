import * as _S3 from './s3';
import * as _Ses from './ses/ses';
import * as _Template from './ses/template';

export const ses = {
  ..._Ses,
  template: _Template,
};

export const s3 = {
  ..._S3,
};
