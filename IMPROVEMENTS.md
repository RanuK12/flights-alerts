# Mejoras del Flight Price Bot

## 🚀 Cambios Implementados

### 1. **URLs de LEVEL Mejoradas**
- **Problema anterior**: Los links llevaban a páginas que no mostraban resultados específicos
- **Solución**: URLs actualizadas con parámetros más específicos:
  ```
  https://www.flylevel.com/flights/search?triptype=RT&origin=EZE&destination=MAD&outboundDate=2025-07-15&currencyCode=USD&adults=1&children=0&infants=0
  ```

### 2. **Mensajes de Alerta Mejorados**
- **Formato de fecha**: Ahora muestra fechas legibles (ej: "lunes, 15 de julio de 2025")
- **Cálculo de ahorro**: Muestra cuánto dinero se ahorra y el porcentaje
- **Mejor estructura**: Información más clara y organizada
- **Emojis informativos**: Para mejor visualización

### 3. **Scraping de Skyscanner Mejorado**
- **Múltiples selectores**: Intenta diferentes selectores CSS para encontrar precios
- **Extracción alternativa**: Si los selectores fallan, busca precios en todo el texto
- **Mejor detección de bots**: Headers y configuración más realista
- **Manejo de errores**: Mejor logging y recuperación de errores

### 4. **Funcionalidades Nuevas**
- **Test script**: `test-improvements.js` para probar las alertas
- **Logging mejorado**: Más información sobre el proceso de scraping
- **Configuración flexible**: Fácil ajuste de parámetros

## 📋 Ejemplo de Alerta Mejorada

```
✈️ ¡VUELO BARATO ENCONTRADO!

Ruta: Buenos Aires → Madrid (EZE → MAD)
Fecha: lunes, 15 de julio de 2025
Precio encontrado: 250 USD
Umbral configurado: 300 USD
💰 Ahorro: 50 USD (16.7%)

🔗 Ver vuelo en LEVEL

⚠️ Importante: Revisa condiciones, equipaje y horarios antes de comprar.
¡Aprovecha la oportunidad! 🚀
```

## 🛠️ Cómo Probar las Mejoras

1. **Ejecutar el test script**:
   ```bash
   node test-improvements.js
   ```

2. **Verificar las alertas en Telegram**:
   - Revisa que los links funcionen correctamente
   - Confirma que el formato sea legible
   - Verifica que los cálculos de ahorro sean correctos

3. **Probar el scraping de Skyscanner**:
   ```bash
   node skyscanner_scraper.js
   ```

## 🔧 Configuración

### Variables de Entorno (.env)
```
TELEGRAM_BOT_TOKEN=tu_token_aqui
TELEGRAM_CHAT_ID=tu_chat_id_aqui
PRICE_THRESHOLD=300
```

### Parámetros de Skyscanner
```javascript
const SKYSCANNER_ORIGINS = ['FCO', 'MAD', 'BCN'];
const SKYSCANNER_DESTINATIONS = ['EZE', 'COR'];
const SKYSCANNER_YEAR = 2025;
const SKYSCANNER_MONTH = '09';
const SKYSCANNER_DAY = '10';
const SKYSCANNER_CURRENCY = 'EUR';
const SKYSCANNER_THRESHOLD = 500;
```

## 🐛 Solución de Problemas

### Si los links no funcionan:
1. Verifica que la URL de LEVEL sea correcta
2. Prueba manualmente en el navegador
3. Ajusta los parámetros en `buildLevelFlightUrl()`

### Si el scraping falla:
1. Revisa los logs para ver qué selectores fallan
2. Actualiza los selectores en el array `selectors`
3. Verifica que Skyscanner no haya cambiado su estructura

### Si las alertas no se envían:
1. Verifica el token de Telegram
2. Confirma el chat ID
3. Revisa los logs de error

## 📈 Próximas Mejoras Sugeridas

1. **Más aerolíneas**: Integrar otras aerolíneas además de LEVEL
2. **Notificaciones por email**: Como respaldo a Telegram
3. **Dashboard web**: Para visualizar estadísticas
4. **Alertas personalizadas**: Diferentes umbrales por usuario
5. **Historial de precios**: Gráficos de evolución de precios

## 📞 Soporte

Para reportar problemas o sugerir mejoras:
1. Revisa los logs del bot
2. Ejecuta el script de test
3. Documenta el error específico 