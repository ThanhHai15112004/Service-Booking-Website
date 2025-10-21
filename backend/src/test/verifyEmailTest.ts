import { sendVerificationEmail } from "../services/Auth/email.service";

(async () => {
  const fakeEmail = "recipient@gmail.com";
  const fakeToken = "testtoken123456789";

  await sendVerificationEmail(fakeEmail, fakeToken);
})();
