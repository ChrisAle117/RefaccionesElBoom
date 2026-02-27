# Política de Seguridad - Refaccionaria El Boom

> [!IMPORTANT]
> **AVISO DE ACCESO RESTRINGIDO**
> Este proyecto es de uso exclusivo para el personal autorizado de **Refaccionaria El Boom**. Queda terminantemente prohibido el uso, copia, distribución o modificación de este sistema por parte de personas ajenas a la organización. Cualquier acceso no autorizado será tratado como una violación a la seguridad de la empresa.

## Compromiso con la Seguridad

En Refaccionaria El Boom, la seguridad de nuestra plataforma de e-commerce y la protección de los datos de nuestros clientes son nuestra máxima prioridad. Valoramos la integridad de nuestro sistema y agradecemos cualquier esfuerzo por mantenerlo seguro.

## Reporte de Vulnerabilidades

Si usted es un usuario autorizado o un investigador de seguridad y descubre una vulnerabilidad potencial, le pedimos que nos lo informe de manera responsable para que podamos resolverla a la brevedad.

### Cómo informarnos
Por favor, envíe un reporte detallado a:
- **Correo electrónico:** sistemas@refaccioneselboom.com
- **Asunto:** REPORTE DE SEGURIDAD - [Descripción breve]

### Qué incluir en el reporte
Para ayudarnos a identificar y solucionar el problema, incluya lo siguiente:
- Descripción detallada de la vulnerabilidad.
- Pasos necesarios para reproducir el hallazgo (pueden ser capturas de pantalla o fragmentos de código).
- Impacto potencial del problema detectado.

## Alcance de Seguridad

Esta política cubre los siguientes componentes del proyecto:
- API Backend (Laravel).
- Panel de Administración y Cliente (React/Vite).
- Procesamiento de pagos e integraciones logísticas.

## Pautas de Seguridad para Desarrolladores

1. **Gestión de Secretos:** Nunca incluya claves API, contraseñas o datos sensibles en el repositorio de código. Use archivos `.env` localmente.
2. **Actualizaciones:** Mantenga las dependencias de `composer` y `npm` actualizadas para mitigar riesgos conocidos.
3. **Validación:** Asegure que todas las entradas de usuario sean validadas y sanitizadas antes de ser procesadas por el sistema.

---
*Última actualización: Febrero 2026*
