# Carpeta de Imágenes

Esta carpeta contiene todos los recursos de imagen para el sitio web del restaurante de sushi.

## Estructura recomendada:

- `logo.png` o `logo.svg` - Logo principal del restaurante
- `hero/` - Imágenes para la sección principal
- `menu/` - Fotos de los platos del menú
- `team/` - Fotos del equipo y chefs
- `restaurant/` - Fotos del interior del restaurante
- `icons/` - Iconos personalizados

## Formatos recomendados:

- **Logo**: SVG (escalable) o PNG con fondo transparente
- **Fotos**: WebP para mejor optimización, o JPG/PNG
- **Iconos**: SVG o PNG

## Tamaños recomendados:

- **Logo**: 200x60px aproximadamente
- **Hero images**: 1920x1080px
- **Menu items**: 400x300px
- **Team photos**: 300x300px

Una vez que coloques tu logo aquí, podrás usarlo en el componente Header con:
```jsx
<Image src="/images/logo.png" alt="Sushi Restaurant Logo" width={200} height={60} />
```