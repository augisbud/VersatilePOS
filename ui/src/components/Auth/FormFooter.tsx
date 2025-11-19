import { useNavigate } from 'react-router-dom';
import { RouteId } from '@/types/routes';

interface FormFooterProps {
  state: 'login' | 'register';
}

export const FormFooter = ({ state }: FormFooterProps) => {
  const navigate = useNavigate();

  const config = {
    login: {
      text: "Don't have an account?",
      linkText: 'Register',
      route: `/${RouteId.REGISTER}`,
    },
    register: {
      text: 'Already have an account?',
      linkText: 'Log in',
      route: `/${RouteId.LOGIN}`,
    },
  };

  const { text, linkText, route } = config[state];

  return (
    <div style={{ textAlign: 'center', marginTop: '16px' }}>
      {text}{' '}
      <a
        onClick={() => {
          void navigate(route);
        }}
        style={{ cursor: 'pointer' }}
      >
        {linkText}
      </a>
    </div>
  );
};
