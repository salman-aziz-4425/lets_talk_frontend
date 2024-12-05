import React from "react";
import Image from "next/image";

interface ImageProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    enablePulse?: boolean;
    [key: string]: any;
}

const PulseImage: React.FC<ImageProps> = ({
    src,
    alt,
    width,
    height,
    className,
    enablePulse = false,
    ...rest
}) => {
    return (
        <>
           {
            enablePulse && (
                <style jsx>{`
                    @keyframes pulse {
                        0% {
                            transform: scale(1);
                            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
                        }
                        50% {
                            transform: scale(1.1);
                            box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.3);
                        }
                        100% {
                            transform: scale(1);
                            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
                        }
                    }
                    .pulse {
                        animation: pulse 2s infinite;
                    }
                `}</style>
            )
           }
            <Image
                src={src}
                alt={alt}
                width={width}
                style={{
                    borderRadius: "50%",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                    animation: "pulse 2s infinite",
                }}
                height={height}
                className={`${enablePulse ? "pulse" : ""} ${className || ""}`}
                {...rest}
            />
        </>
    );
};

export default PulseImage;
