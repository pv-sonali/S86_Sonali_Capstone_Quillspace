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
    primary: 'bg-gold text-button-dark hover:bg-yellow-400 active:scale-95 shadow-lg hover:shadow-xl',
    secondary: 'border border-gold text-gold hover:bg-gold hover:text-button-dark active:scale-95',
    ghost: 'text-text hover:text-gold',
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
