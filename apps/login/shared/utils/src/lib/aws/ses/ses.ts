import { SES, SESClientConfig } from '@aws-sdk/client-ses';
// import { fromIni } from '@aws-sdk/credential-provider-ini';
import { generateRandomN } from '../../MersenneTwister';
import * as template from './template';

let ses: SES;

/**
 * Simple Email Service > 메일 보내기
 * @example
 * await sendMail(
 *  'help@yeastudio.net',
 *  ['to@a.com'],
 *  ['cc@b.com'],
 *  '제목',
 *  `<h2>이메일 내용</h2>`,
 * )
 */
export const sendMail = async function (
  from: string,
  to: string[],
  cc: string[],
  subject: string,
  htmlBody: string,
) {
  if (!ses) {
    if (!ses) {
      const clientOpt: SESClientConfig = {
        region: 'ap-northeast-2', // Default region
        apiVersion: 'latest',
      };

      // TODO [info] on local need aws profile
      // clientOpt['credentials'] = fromIni({
      //   profile: process.env['AWS_PROFILE'],
      // });

      ses = new SES(clientOpt);
    }
  }

  const params = {
    Source: from /* required */,
    Destination: {
      /* required */
      CcAddresses: cc,
      ToAddresses: to,
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: htmlBody,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
  };
  return ses.sendEmail(params);
};

const templateDefaultString = {
  sendAuthCode: {
    title: '이메일 인증코드',
    content: '아래 코드를 회원 가입 창에 입력해주세요.',
    authCode: '인증',
  },
};

/**
 * 이메일 인증코드 발송
 */
const sendAuthCode = async function (
  email: string,
  authCode: string = generateRandomN(),
) {
  const html = template.SendEmailAuth.build({
    logoImg: `http://assets.${process.env['SERVICE_DOMAIN']}/images/logo.png`,
    title: templateDefaultString.sendAuthCode.title,
    content: templateDefaultString.sendAuthCode.content,
    authCode,
  });
  const emailTitle = `[${process.env['SERVICE_NAME']}] ${templateDefaultString.sendAuthCode.title}`;
  const sender =
    process.env['EMAIL_SENDER'] || `no-reply@${process.env['SERVICE_DOMAIN']}`;
  return sendMail(sender, [email], [], emailTitle, html);
};

export const formmat = {
  sendAuthCode,
};
