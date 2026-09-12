import { PashizBrand } from '@/components/Icons/PashizBrand';
import { ReactNode } from 'react';
import styled from 'styled-components';
import { Icon } from '@/components';

interface AuthContainerProps {
  children: ReactNode;
}

export function AuthContainer({ children }: AuthContainerProps) {
  return (
    <AuthPage>
      <AuthInsider>
        <AuthLogo>
          <PashizBrand height={34} />
        </AuthLogo>

        {children}
      </AuthInsider>
    </AuthPage>
  );
}

const AuthPage = styled.div``;
const AuthInsider = styled.div`
  width: 384px;
  max-width: 100%;
  margin: 0 auto;
  margin-bottom: 40px;
  padding: 80px 16px 0;
  box-sizing: border-box;

  /* A phone is narrower than the card; the card gives way, not the phone. */
  @media (max-width: 599.98px) {
    padding-top: 40px;
  }
`;

const AuthLogo = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;
