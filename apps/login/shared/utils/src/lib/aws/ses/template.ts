// key color
// #2D56FF
// #4000F5
// #3642C6
// #000000

export interface SendEmailAuthParam {
  logoImg: string;
  title: string;
  content: string;
  authCode: string;
}

const sendEmailAuthForm = `
<div
  style="
    margin: auto;
    width: 600px;
    height: 360px;
    border: 1px black solid;
    border-radius: 16px;
    padding: 24px 60px 48px 60px;
  "
>
  <div style="width: 100%; height: 100%">
    <img src="{logoImg}" alt="logo" style="width: 200px; height: 80px" />
    <div style="margin-top: 48px; line-height: 42px; font-size: 42px">
      {title}
    </div>
    <div style="margin-top: 48px; line-height: 32px; font-size: 20px">
      {content}
    </div>
    <div style="margin-top: 48px; width: 100%">
      <div
        style="
          width: 48%;
          margin: auto;
          padding: 16px 8px 0px 8px;
          border-radius: 16px;
          border: #000000 solid 1px;
          text-align: center;
          font-weight: 700;
          font-size: 36px;
          line-height: 72px;
          color: #000000;
          font-style: normal;
          text-decoration: none;
        "
      >
        {authCode}
      </div>
    </div>
  </div>
</div>
`;

const sendEmailAuthBuilder = (param: SendEmailAuthParam) =>
  htmlMinify(
    sendEmailAuthForm
      .replace('{logoImg}', param.logoImg)
      .replace('{title}', param.title)
      .replace('{content}', param.content)
      .replace('{authCode}', param.authCode),
  );

function htmlMinify(html: string) {
  return html.replace(/>\s+</g, '><');
}

export const SendEmailAuth = {
  form: sendEmailAuthForm,
  build: sendEmailAuthBuilder,
};
