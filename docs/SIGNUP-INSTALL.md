# Foresight — регистрация + подтверждение почты

Файлы уже в репозитории. Осталось сделать шаги ниже.

| Файл                            | Роль                                             |
| -------------------------------- | ------------------------------------------------ |
| `app/signup/page.tsx`            | страница `/signup`, RU/EN                        |
| `app/signup/SignupForm.tsx`      | клиентская форма (`useActionState`)              |
| `app/signup/actions.ts`          | server actions: регистрация и повторная отправка |
| `app/verify/page.tsx`            | `/verify` — результат подтверждения              |
| `app/verify/ResendForm.tsx`      | форма повторной отправки                         |
| `app/api/auth/verify/route.ts`   | GET с токеном из письма → redirect на `/verify`  |
| `app/api/auth/register/route.ts` | JSON-регистрация для лаунчера                    |
| `lib/verification.ts`            | выдача/проверка токенов, шаблон письма           |
| `lib/mailer.ts`                  | отправка почты (Resend или лог в консоль)        |
| `lib/rateLimit.ts`               | антиспам по IP                                   |
| `prisma/schema.additions.prisma` | что добавить в схему                             |

## 1. Подтянуть код на VPS

```bash
cd ~/RadarHackSite
git pull
```

## 2. Поправить схему Prisma

В `prisma/schema.prisma`, в модель `User`:

```prisma
  emailVerified      DateTime?
  verificationTokens EmailVerificationToken[]
```

И в конец файла:

```prisma
model EmailVerificationToken {
  id         String    @id @default(cuid())
  tokenHash  String    @unique
  userId     String
  expiresAt  DateTime
  consumedAt DateTime?
  createdAt  DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
}
```

Затем:

```bash
npx prisma db push
npx prisma generate
```

Проверь имя поля с хешем пароля в модели `User`. Код ожидает `passwordHash`.
Если у тебя оно называется иначе (например `password`), поменяй в двух местах:
`app/signup/actions.ts` и `app/api/auth/register/route.ts`.

## 3. Закрыть вход без подтверждения

В `app/login/actions.ts`, после проверки пароля и до выдачи cookie:

```ts
if (!user.emailVerified) {
  return { error: "Подтвердите email — письмо ушло на ваш адрес." };
}
```

В `app/api/auth/login/route.ts`:

```ts
if (!user.emailVerified) {
  return NextResponse.json({ error: "email_not_verified" }, { status: 403 });
}
```

Старые аккаунты (включая demo) пометь подтверждёнными один раз:

```bash
npx prisma db execute --stdin <<'SQL'
UPDATE User SET emailVerified = CURRENT_TIMESTAMP WHERE emailVerified IS NULL;
SQL
```

## 4. Ссылка на регистрацию

В `components/Header.tsx` рядом с кнопкой входа:

```tsx
<Link href="/signup">Создать аккаунт</Link>
```

И в `app/login` добавь строку «Нет аккаунта? → /signup».

## 5. Почта

Добавь в `.env.production` на VPS:

```dotenv
MAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
MAIL_FROM="Foresight <no-reply@твой-домен>"
```

Без ключа модуль работает в режиме `console`: письмо не уходит, а ссылка печатается в логи:

```bash
sudo docker compose --env-file .env.production logs --tail=50 web | grep mailer
```

Удобно для теста без домена. Важно: без своего домена письма с IP-адреса
почти гарантированно уйдут в спам — SPF/DKIM настраиваются только на домене.

Также проверь, что `NEXT_PUBLIC_APP_URL` совпадает с адресом сайта — из него строится ссылка в письме.

## 6. Пересобрать

```bash
sudo docker compose --env-file .env.production up -d --build web
```

## 7. Проверка

1. Открой `/signup`, создай аккаунт.
2. Возьми ссылку из письма или из логов и открой её.
3. Должно перебросить на `/verify?status=verified`.
4. Повторный клик по той же ссылке → `status=already`.
5. Войди на `/login`.

## Что сделано по безопасности

- токен 32 случайных байта, в БД хранится только SHA-256 хеш
- срок жизни 24 часа, одноразовое использование (`consumedAt`)
- при повторной выдаче старые неиспользованные токены удаляются
- форма не говорит, зарегистрирован ли email (нет перебора адресов)
- bcrypt с 12 раундами
- rate limit: 5 регистраций/мин и 3 письма/5 мин с одного IP
- скрытое поле-ловушка против ботов

Rate limit живёт в памяти процесса — для одного контейнера этого достаточно.
