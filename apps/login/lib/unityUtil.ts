"use client";

export const toUnity = async (accountId: string, firebaseUid: string, idToken: string) => {
  try {
    const sendData = JSON.stringify({
      accountId,
      firebaseUid,
      idToken,
    });
    console.debug("SEND DATA: ", sendData);

    try {
      // alert('Login Success! Redirecting to Game...');
      // alert(`atoz-signin://${sendData}`);
      // console.log(accountId);

      // TODO : unity ------- //
      const base = "https://login.dev.atozgames.net";
      const url = `${base}/atoz-signin://${sendData}`;
      console.debug("URL: ", url);
      // FIXME: 이거 풀어야함
      // FIXME: 그런데, 이거 있으니까 Naver 로그인 시 쿠키 세팅이 안되는 느낌..?
      window.location.replace(url);
    } catch (err) {
      // logger.error(
      //   `[JS] Try to call unity [customSchema(atoz-signin://)] failed : `,
      //   err,
      // );
      console.error("UNITY ERROR: ", err);
    }
  } catch (err) {
    console.error("UNITY ERROR: ", err);
    // logger.error('[JS] send data build failed : ', err);
  }
};
