import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    const { className, ...rest } = props;
    return <img src="/lp-logo.png" alt="Life Partner Logo" className={className} {...rest} />;
}
