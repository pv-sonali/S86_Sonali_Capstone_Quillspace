import { useNavigate } from 'react-router-dom';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  to,
  disabled = false,
  isLoading = false,
  className = '',
  type = 'button',
  ...props
}) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    // If it's a form submit button, let the form handle submission
    if (type === 'submit') {
      return;
    }
    
    if (to) {
      navigate(to);
    } else if (onClick) {
      onClick(e);
    }
  };

  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 ease-in-out inline-flex items-center justify-center gap-2 cursor-pointer';

  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover active:scale-95 hover:scale-[1.02] shadow-sm',
    secondary: 'bg-transparent border border-border text-text-secondary hover:border-accent hover:text-white active:scale-95',
    ghost: 'text-text-secondary hover:text-accent',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${disabledStyles}
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
