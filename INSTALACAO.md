# Guia de Instalação - Gerador de Arte ANETI

Este documento fornece instruções detalhadas para instalação e configuração do sistema em diferentes ambientes.

## Pré-requisitos

### Servidor Web
- **PHP**: Versão 8.1 ou superior
- **Extensões PHP obrigatórias**:
  - `php-gd` (manipulação de imagens)
  - `php-cli` (linha de comando)
- **Servidor Web**: Apache, Nginx ou PHP built-in server

### Verificação dos Requisitos

```bash
# Verificar versão do PHP
php --version

# Verificar extensões instaladas
php -m | grep -i gd

# Verificar configurações do PHP
php -i | grep -i "upload_max_filesize\|post_max_size\|max_execution_time"
```

## Instalação em Servidor Linux (Ubuntu/Debian)

### 1. Instalação do PHP e Extensões

```bash
# Atualizar repositórios
sudo apt update

# Instalar PHP e extensões necessárias
sudo apt install -y php php-gd php-cli

# Para Apache
sudo apt install -y apache2 libapache2-mod-php

# Para Nginx
sudo apt install -y nginx php-fpm
```

### 2. Configuração do Apache

```bash
# Habilitar mod_rewrite
sudo a2enmod rewrite

# Reiniciar Apache
sudo systemctl restart apache2
```

**Configuração do Virtual Host** (`/etc/apache2/sites-available/aneti-art.conf`):

```apache
<VirtualHost *:80>
    ServerName aneti-art.local
    DocumentRoot /var/www/aneti-art-generator
    
    <Directory /var/www/aneti-art-generator>
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/aneti-art_error.log
    CustomLog ${APACHE_LOG_DIR}/aneti-art_access.log combined
</VirtualHost>
```

```bash
# Habilitar o site
sudo a2ensite aneti-art.conf
sudo systemctl reload apache2
```

### 3. Configuração do Nginx

**Configuração do Server Block** (`/etc/nginx/sites-available/aneti-art`):

```nginx
server {
    listen 80;
    server_name aneti-art.local;
    root /var/www/aneti-art-generator;
    index index.html index.php;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

```bash
# Habilitar o site
sudo ln -s /etc/nginx/sites-available/aneti-art /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Deploy dos Arquivos

```bash
# Criar diretório
sudo mkdir -p /var/www/aneti-art-generator

# Copiar arquivos (ajuste o caminho conforme necessário)
sudo cp -r aneti-art-generator/* /var/www/aneti-art-generator/

# Definir permissões
sudo chown -R www-data:www-data /var/www/aneti-art-generator
sudo chmod -R 755 /var/www/aneti-art-generator
```

## Instalação em Servidor Windows (IIS)

### 1. Instalação do PHP

1. Baixe o PHP 8.1+ do site oficial (php.net)
2. Extraia para `C:\php`
3. Copie `php.ini-production` para `php.ini`
4. Edite `php.ini` e descomente:
   ```ini
   extension=gd
   extension=openssl
   ```

### 2. Configuração do IIS

1. Instale o IIS através do "Recursos do Windows"
2. Instale o "CGI" no IIS
3. Baixe e instale o "PHP Manager for IIS"
4. Configure o PHP no IIS Manager

### 3. Deploy dos Arquivos

1. Copie os arquivos para `C:\inetpub\wwwroot\aneti-art-generator`
2. Configure as permissões para o usuário IIS

## Instalação para Desenvolvimento Local

### Usando PHP Built-in Server

```bash
# Navegue até o diretório do projeto
cd aneti-art-generator

# Inicie o servidor
php -S localhost:8000

# Acesse no navegador
# http://localhost:8000
```

### Usando XAMPP/WAMP

1. Instale XAMPP ou WAMP
2. Copie os arquivos para `htdocs/aneti-art-generator`
3. Inicie Apache no painel de controle
4. Acesse `http://localhost/aneti-art-generator`

## Configurações do PHP

### Ajustes Recomendados no php.ini

```ini
# Tamanho máximo de upload (ajuste conforme necessário)
upload_max_filesize = 10M
post_max_size = 10M

# Tempo limite de execução
max_execution_time = 60

# Memória
memory_limit = 256M

# Habilitar extensão GD
extension=gd
```

### Verificação da Configuração

Crie um arquivo `phpinfo.php` temporário:

```php
<?php
phpinfo();
?>
```

Acesse via navegador e verifique:
- Versão do PHP
- Extensão GD habilitada
- Configurações de upload

**⚠️ Remova o arquivo phpinfo.php após a verificação!**

## Configuração de Segurança

### Permissões de Arquivo

```bash
# Arquivos PHP
chmod 644 *.php

# Diretórios
chmod 755 src/ templates/ assets/

# Arquivo de configuração (se houver)
chmod 600 config.php
```

### Headers de Segurança

Adicione ao `.htaccess` (Apache) ou configuração do Nginx:

```apache
# .htaccess para Apache
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
```

## Teste da Instalação

### 1. Teste Básico

1. Acesse a URL da aplicação
2. Verifique se a página carrega corretamente
3. Teste o formulário sem upload

### 2. Teste de Upload

1. Selecione uma imagem de teste
2. Preencha todos os campos
3. Clique em "Gerar minha arte"
4. Verifique se o download é iniciado

### 3. Teste de Responsividade

1. Teste em diferentes tamanhos de tela
2. Verifique em dispositivos móveis
3. Teste em diferentes navegadores

## Solução de Problemas Comuns

### Erro: "Call to undefined function imagecreatefrompng()"

**Solução**: Instalar/habilitar extensão GD

```bash
# Ubuntu/Debian
sudo apt install php-gd
sudo systemctl restart apache2

# CentOS/RHEL
sudo yum install php-gd
sudo systemctl restart httpd
```

### Erro: "File upload error"

**Possíveis causas**:
- Arquivo muito grande
- Permissões incorretas
- Diretório temporário inacessível

**Soluções**:
```bash
# Verificar permissões
ls -la /tmp

# Ajustar configurações PHP
upload_max_filesize = 10M
post_max_size = 10M
```

### Erro: "Template not found"

**Solução**: Verificar se os templates estão no local correto

```bash
# Verificar estrutura
ls -la templates/
# Deve mostrar: publico.png, junior.png, pleno.png, senior.png
```

### Erro: "Font not found"

**Solução**: Verificar se a fonte está no local correto

```bash
# Verificar fonte
ls -la assets/OpenSans-Bold.ttf
```

## Backup e Manutenção

### Backup

```bash
# Backup completo
tar -czf aneti-art-backup-$(date +%Y%m%d).tar.gz aneti-art-generator/

# Backup apenas dos templates (se personalizados)
tar -czf templates-backup-$(date +%Y%m%d).tar.gz aneti-art-generator/templates/
```

### Logs

```bash
# Logs do Apache
tail -f /var/log/apache2/aneti-art_error.log

# Logs do Nginx
tail -f /var/log/nginx/error.log

# Logs do PHP
tail -f /var/log/php_errors.log
```

## Suporte

Para problemas de instalação, verifique:

1. **Logs do servidor web**
2. **Logs do PHP**
3. **Permissões de arquivo**
4. **Configurações do PHP**

Se o problema persistir, documente:
- Sistema operacional e versão
- Versão do PHP
- Servidor web utilizado
- Mensagem de erro completa
- Passos para reproduzir o problema

