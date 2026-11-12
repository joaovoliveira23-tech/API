# ApiMeteo — versão React sem backend

Esta versão removeu completamente o backend Java/Spring Boot. O navegador consulta diretamente a API pública Open-Meteo, então você não precisa instalar Java nem Maven.

## Requisitos
- Node.js 18 ou superior
- VS Code (opcional)

## Como iniciar no Windows
1. Instale o Node.js LTS: https://nodejs.org/
2. Extraia a pasta `ApiMeteo-React`.
3. Abra essa pasta no VS Code.
4. No terminal do VS Code, execute:

```bash
npm install
npm run dev
```

5. Abra o endereço local mostrado no terminal (normalmente http://localhost:5173).

## O que foi alterado
- Removidos `backend/`, Java, Spring Boot, Maven e chamadas para servidor próprio.
- Busca de cidades e previsão meteorológica feitas diretamente pelo React usando Open-Meteo.
- Mantidos tema visual que muda de acordo com o clima, efeitos visuais de chuva, painel atual, previsão horária e previsão de 5 dias.
- O globo é uma ilustração 3D decorativa e não depende de chave de API.

## Google Maps / Google Earth
A versão atual usa um globo ilustrativo em CSS 3D, sem chave e sem configuração. Se quiser um globo geográfico real e interativo do Google, será necessário configurar uma chave do Google Maps Platform e habilitar as APIs/recursos correspondentes. O Google Earth não é uma API pública genérica que possa ser ativada apenas com uma URL.

## Fonte dos dados
Open-Meteo: https://open-meteo.com/
A API pública pode ter limites e condições de uso próprios; consulte a documentação antes de publicar um serviço comercial.
