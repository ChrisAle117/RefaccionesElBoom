export default function AppLogoIcon(props: React.ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src={document.documentElement.classList.contains('dark') ? '/images/logotipo-claro.png' : '/images/logotipo.png'}
            alt="Refaccionaria El Boom"
            className="w-32 h-auto max-w-none mx-auto"
        />
    )
}
