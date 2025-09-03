"use client";

export const toUnity = async (accountId: string, firebaseUid: string, idToken: string) => {
  try {
    const sendData = JSON.stringify({
      accountId,
      firebaseUid,
      idToken,
    });

    try {
      // alert('Login Success! Redirecting to Game...');
      // alert(`atoz-signin://${sendData}`);
      // console.log(accountId);

      // TODO : unity ------- //
      const base = "https://login.dev.atozgames.net";
      const url = `${base}/atoz-signin://${sendData}`;
      window.location.replace(url);
    } catch (err) {
      // logger.error(
      //   `[JS] Try to call unity [customSchema(atoz-signin://)] failed : `,
      //   err,
      // );
      console.error(err);
    }
  } catch (err) {
    console.error(err);
    // logger.error('[JS] send data build failed : ', err);
  }
};
