# 🏮 Mazuhi Sushi - Flujo de Trabajo Git

## 👥 Colaboradores
- **MrOlcha** (Propietario)
- **lilyei7** (Colaborador)

## 🔄 Flujo de Trabajo para Colaboración

### Antes de empezar a trabajar:
```bash
# 1. Actualizar tu rama local con los cambios del repositorio
cd /var/www
git pull origin master

# 2. Crear una rama para tu trabajo (reemplaza "mi-feature" con tu tarea)
git checkout -b feature/mi-cambio
```

### Durante el desarrollo:
```bash
# Ver cambios realizados
git status

# Agregar archivos modificados
git add .

# Hacer commit con mensaje descriptivo
git commit -m "feat: descripción de lo que hiciste"
```

### Para subir tus cambios:
```bash
# Subir tu rama al repositorio
git push origin feature/mi-cambio

# Ir a GitHub y crear un Pull Request
# Pedir revisión a tu compañero
```

### Después de que se apruebe el PR:
```bash
# Volver a la rama master
git checkout master

# Actualizar con los cambios fusionados
git pull origin master

# Eliminar la rama local que ya no necesitas
git branch -d feature/mi-cambio
```

## ⚠️ Reglas Importantes

1. **Nunca trabajar directamente en `master`** - Siempre crear ramas
2. **Hacer commits pequeños y frecuentes** con mensajes claros
3. **Antes de empezar**: `git pull origin master`
4. **Después de terminar**: Crear Pull Request para revisión
5. **Comunicarse** con tu compañero sobre qué están trabajando

## 🛠️ Comandos Útiles

```bash
# Ver estado de archivos
git status

# Ver historial de commits
git log --oneline

# Ver diferencias
git diff

# Cambiar de rama
git checkout nombre-rama

# Ver todas las ramas
git branch -a
```

## 🚨 En caso de conflictos

Si hay conflictos al hacer `git pull`:

```bash
# Abortar el merge
git merge --abort

# Comunicarse con tu compañero para resolver
# O hacer stash de tus cambios
git stash
git pull origin master
git stash pop
```