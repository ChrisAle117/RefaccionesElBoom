export default function AppLogoIcon({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src={document.documentElement.classList.contains('dark') ? '/images/logotipo-claro.png' : '/images/logotipo.png'}
            alt="Refaccionaria El Boom"
            className={className || "w-32 h-auto max-w-none mx-auto"}
        />
    )
}
