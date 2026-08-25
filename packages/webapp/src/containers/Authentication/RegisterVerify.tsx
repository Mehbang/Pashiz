import intl from 'react-intl-universal';
import { Button, Intent } from '@blueprintjs/core';
import { x } from '@xstyled/emotion';
import { AuthInsiderCard } from './_components';
import { AuthContainer } from './AuthContainer';
import { AuthInsider } from './AuthInsider';
import { AppToaster, Stack } from '@/components';
import { useAuthSignUpVerifyResendMail } from '@/hooks/query';
import { useAuthActions, useAuthUserVerifyEmail } from '@/hooks/state';
import { useIsDarkMode } from '@/hooks/useDarkMode';

export function RegisterVerify() {
  const { setLogout } = useAuthActions();
  const { mutateAsync: resendSignUpVerifyMail, isPending } =
    useAuthSignUpVerifyResendMail();

  const emailAddress = useAuthUserVerifyEmail();
  const isDarkMode = useIsDarkMode();

  const handleResendMailBtnClick = () => {
    resendSignUpVerifyMail()
      .then(() => {
        AppToaster.show({
          intent: Intent.SUCCESS,
          message: intl.get('the_verification_mail_has_sent_successfully'),
        });
      })
      .catch(() => {
        AppToaster.show({
          intent: Intent.DANGER,
          message: intl.get('something_wentwrong'),
        });
      });
  };
  const handleSignOutBtnClick = () => {
    setLogout();
  };

  return (
    <AuthContainer>
      <AuthInsider>
        <AuthInsiderCard textAlign="center">
          <x.h2
            fontSize="18px"
            fontWeight={600}
            mb="0.5rem"
            color={isDarkMode ? 'rgba(255, 255, 255, 0.85)' : '#252A31'}
          >
            {intl.get('please_verify_your_email')}
          </x.h2>
          <x.p
            mb="1rem"
            fontSize="15px"
            lineHeight="1.45"
            color={isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#404854'}
          >
            We sent an email to <strong>{emailAddress}</strong> Click the link
            inside to get started.
          </x.p>

          <Stack spacing={4}>
            <Button
              large
              fill
              loading={isPending}
              intent={Intent.NONE}
              onClick={handleResendMailBtnClick}
            >
              {intl.get('resend_email')}
            </Button>

            <Button
              large
              fill
              minimal
              intent={Intent.DANGER}
              onClick={handleSignOutBtnClick}
            >
              {intl.get('not_my_email')}
            </Button>
          </Stack>
        </AuthInsiderCard>
      </AuthInsider>
    </AuthContainer>
  );
}
