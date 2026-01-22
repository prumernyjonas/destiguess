# Návod na spuštění DestiGuess aplikace

## Krok 1: Spusťte Docker Desktop
Ujistěte se, že máte spuštěný Docker Desktop na vašem Macu.

## Krok 2: Spusťte PostgreSQL databázi
V terminálu v adresáři projektu spusťte:

```bash
cd /Users/suryj/Desktop/_Destiguess/destiguess
docker compose up -d
```

Tím se spustí PostgreSQL kontejner na pozadí. Můžete zkontrolovat, že běží pomocí:
```bash
docker ps
```

## Krok 3: Vytvořte .env soubor
Vytvořte soubor `.env` v kořenovém adresáři projektu (`/Users/suryj/Desktop/_Destiguess/destiguess/.env`) s následujícím obsahem:

```
DATABASE_URL="postgresql://destiguess:destiguess123@localhost:5432/destiguess?schema=public"
```

## Krok 4: Spusťte Prisma migrace
Vytvoří databázové tabulky:

```bash
npm run prisma:migrate
```

Při prvním spuštění vás Prisma zeptá na název migrace - můžete zadat například: `init`

## Krok 5: Vygenerujte Prisma klienta
```bash
npm run prisma:generate
```

## Krok 6: Naplňte databázi seed daty
Vytvoří 20 lokací v databázi:

```bash
npm run prisma:seed
```

## Krok 7: Spusťte vývojový server
```bash
npm run dev
```

## Krok 8: Otevřete aplikaci v prohlížeči
Přejděte na: http://localhost:3000/play

---

## Rychlý souhrn všech příkazů (zkopírujte a spusťte jeden po druhém):

```bash
# 1. Spusťte Docker Desktop (ručně v aplikaci)

# 2. Spusťte PostgreSQL
cd /Users/suryj/Desktop/_Destiguess/destiguess
docker compose up -d

# 3. Vytvořte .env soubor (viz výše - vytvořte ručně)

# 4-6. Nastavte databázi
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed

# 7. Spusťte aplikaci
npm run dev
```

---

## Poznámky:

- **Závislosti jsou už nainstalované** (node_modules existuje)
- **Docker musí běžet** - pokud Docker Desktop neběží, spusťte ho
- **.env soubor musíte vytvořit ručně** - není v git (kvůli bezpečnosti)
- Po prvním spuštění můžete použít `npm run dev` přímo

## Pokud něco nefunguje:

1. **Docker neběží**: Spusťte Docker Desktop aplikaci
2. **Chyba s databází**: Zkontrolujte, že PostgreSQL kontejner běží (`docker ps`)
3. **Chyba s Prisma**: Ujistěte se, že máte správný `.env` soubor s `DATABASE_URL`
