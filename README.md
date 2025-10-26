# Base Batches Dapp

Aplicación web inspirada en `ui/apps/sports`, ahora adaptada para operar en la blockchain de Base con un contrato inteligente propio.

## Características
- UI de packs y landing reutilizada del proyecto original.
- Integración con wallets EVM mediante `wagmi` y soporte para Base/Mainnet o Base Sepolia.
- Compra de packs (`Bronze`, `Silver`, `Gold`) directamente contra el contrato `Sports`.
- Sign in with Base y Base Pay listos para usar desde el SDK oficial.
- Dashboard simple para consultar tus equipos y alternar su estado de *staking*.

## Estructura relevante
- `app/` — rutas Next.js (landing, buy-pack, dashboard).
- `components/` — componentes UI reutilizados y adaptados.
- `lib/base/` — configuración de wagmi, hooks y ABI del contrato.
- `contracts/Sports.sol` — contrato Solidity con la lógica mínima de packs/staking.

## Variables de entorno
Configura un archivo `.env.local` con la red y contrato deseados (ver `.env.example`):

```
NEXT_PUBLIC_BASE_NETWORK=sepolia   # o "mainnet"
NEXT_PUBLIC_BASE_RPC_URL=...       # opcional, usa RPC público por defecto
NEXT_PUBLIC_BASE_CONTRACT_ADDRESS=0x... # dirección desplegada del contrato
NEXT_PUBLIC_BASE_PAY_APP_NAME=Base Batches
NEXT_PUBLIC_BASE_PAY_LOGO_URL=https://raw.githubusercontent.com/base-org/brand-kit/main/logo/base-logo-primary.png
NEXT_PUBLIC_BASE_PAY_RECIPIENT=0x... # address que recibe pagos con Base Pay
NEXT_PUBLIC_BASE_PAY_AMOUNT=0.01     # monto USD por defecto
NEXT_PUBLIC_BASE_PAY_TESTNET=true    # true para Base Sepolia
```

## Contrato Sports
El contrato permite:
- Comprar packs (`buyPack`) pagando el precio on-chain.
- Consultar equipos del usuario (`getUserTeams` / `getTeam`).
- Alternar staking (`setTeamStake`).
- Actualizar precios y retirar fondos por parte del owner.

El ABI está disponible en `lib/base/abi/sports.ts` para su consumo desde la app. Actualiza la dirección del contrato tras desplegarlo en Base o Base Sepolia.

### Deploy en Base Sepolia con Hardhat
En `base_batches/hardhat` quedó listo un proyecto configurado:

1. Copia `.env.example` → `.env` y completa:
   ```
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org        # o tu RPC propio
   BASE_SEPOLIA_PRIVATE_KEY=0x...                       # clave del deployer con ETH en Base Sepolia
   ```
   Opcionalmente puedes definir parámetros del constructor en el entorno antes de desplegar:
   ```
   PACK_PRICE_BRONZE_ETH=0.0005   # o PACK_PRICE_BRONZE_WEI con el valor entero
   PACK_PRICE_SILVER_ETH=0.001
   PACK_PRICE_GOLD_ETH=0.002
   METADATA_BASE_URI=https://tu-cdn.com/metadata/
   TIME_LOCK_SECONDS=86400        # ventana de bloqueo para retiros
   ```
2. Compila: `cd base_batches/hardhat && npx hardhat compile`.
3. Despliega: `npx hardhat run scripts/deploy.js --network baseSepolia`.
4. Actualiza `NEXT_PUBLIC_BASE_CONTRACT_ADDRESS` con la dirección impresa por el script.

> Necesitas fondear la cuenta con ETH de Base Sepolia desde el faucet oficial antes de ejecutar el deploy.

## Base Account SDK
- `components/BaseAccount/BaseAccountWidget.tsx` integra Sign in with Base y Base Pay.
- Configura las variables anteriores para personalizar nombre, logo, red y receptor de pagos.
- El widget aparece en `app/buy-pack/page.tsx` junto al flujo de compra on-chain para ofrecer pagos en USDC vía Base Pay.

## Carga masiva de jugadores
El contrato expone `createPlayersBatch`, pensado para cargar el roster inicial en una sola pasada.

1. Configura `base_batches/hardhat/.env` con la clave del deployer (debe ser owner del contrato) y la RPC.
2. Define `BASE_CONTRACT_ADDRESS` (y opcionalmente `PLAYERS_CSV_PATH`, `PLAYERS_BATCH_SIZE`) al ejecutar el script.
3. Ejecuta:

```bash
cd base_batches/hardhat
npx hardhat run scripts/loadPlayers.js --network baseSepolia
```

Por defecto el script consume `/Users/emanuel/dev/funraise/sports/data/players.csv`, agrupa en lotes de 20 y
crea automáticamente cada jugador con sus metadatos.
Si la red está congestionada puedes ajustar las fees con:

```
GAS_BUMP_PERCENT=130            # multiplicador sobre las fees reportadas (>=100)
MIN_PRIORITY_FEE_GWEI=2         # prioridad mínima en gwei
```

## Scripts disponibles

```bash
npm run dev         # arranca el servidor (puerto 3002 por defecto)
npm run build       # build de producción (ignora validaciones de lint/types por ahora)
npm run start       # serve del build
npm run lint        # eslint
```

> Nota: el proyecto sigue usando los mismos assets y componentes que `ui/apps/sports`, por lo que mantiene la identidad visual original pero ahora conectado al ecosistema de Base.
