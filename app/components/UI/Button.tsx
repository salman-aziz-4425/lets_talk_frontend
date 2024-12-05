import { Button as NextButton } from "@nextui-org/button";

interface ButtonProps {
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
    [key: string]: any; 
}

const Button: React.FC<ButtonProps> = ({ className, children, onClick, ...rest }) => {
    return (
        <NextButton
            {...rest}
            color="primary"
            className={className}
            onClick={onClick}
        >
            {children}
        </NextButton>
    );
};

export default Button;
