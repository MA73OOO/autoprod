# 🗄️ Documentación de Base de Datos e Infraestructura IaC

## 📌 Esquema de Base de Datos (Prisma + Supabase PostgreSQL)

### Modelo de Datos (`prisma/schema.prisma`)
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  name         String?
  geminiApiKey String?
  subscription String    @default("FREE")
  channels     Channel[]
  createdAt    DateTime  @default(now())
}

model Channel {
  id        String    @id @default(uuid())
  name      String
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  projects  Project[]
  createdAt DateTime  @default(now())
}

model Project {
  id          String   @id @default(uuid())
  name        String
  channelId   String
  channel     Channel  @relation(fields: [channelId], references: [id], onDelete: Cascade)
  title       String?
  description String?
  tags        String[]
  status      String   @default("DRAFT")
  createdAt   DateTime @default(now())
}
```

---

## 🏗️ Infraestructura como Código (Terraform)

Toda la infraestructura se despliega automáticamente ejecutando:

```bash
terraform init
terraform apply
```

Archivos de Terraform:
* `terraform/main.tf`: Configuración de proveedores (Vercel + Supabase).
* `terraform/variables.tf`: Definición de variables de entorno y secrets.
