import { sendVerificationEmail } from "../services/Authentication&Authorization/email.service";

(async () => {
  const fakeEmail = "recipient@gmail.com";
  const fakeToken = "testtoken123456789";

  await sendVerificationEmail(fakeEmail, fakeToken);
})();
