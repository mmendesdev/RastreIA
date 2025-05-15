# 📱 Alerta Roubos

Aplicativo móvel desenvolvido com Flutter que permite aos cidadãos registrarem objetos roubados de forma simples e rápida. A aplicação facilita o compartilhamento dessas informações com as autoridades policiais, permitindo consultas em tempo real durante operações de segurança. O app também funciona offline e sincroniza os dados automaticamente quando a conexão com a internet estiver disponível.

> **Este projeto foi desenvolvido como parte da avaliação P2 da disciplina _Desenvolvimento para Dispositivos Móveis_, do curso de Engenharia de Software ICEV.**

---

## 🎯 Objetivo

Desenvolver uma solução móvel que:
- Auxilie a população no registro de objetos roubados.
- Ofereça uma interface intuitiva para cadastro e consulta.
- Permita que as autoridades consultem os dados em tempo real.
- Armazene informações localmente em caso de ausência de conexão.

---

## 🚀 Funcionalidades

- Cadastro de objetos roubados com:
  - Nome, tipo, descrição, localização, status (roubado/recuperado)
- Visualização em lista dos objetos registrados
- Suporte a modo offline com armazenamento local (SQLite ou SharedPreferences)
- Sincronização com API RESTful
- Navegação entre telas com passagem de dados
- Interface responsiva com uso de botões, ícones, imagens e campos de texto
- Personalização de nome do app, ícone e identificador do pacote

---

## 🛠️ Tecnologias

- Flutter
- Dart
- SQLite ou SharedPreferences (armazenamento local)
- API RESTful (pública ou própria)
- Gerenciamento de estado com `setState` ou outro padrão leve
- Widgets `Stateless` e `Stateful`
- Requisições HTTP com `http` ou `dio`

---

## 📱 Plataformas

- Android (testado em emulador e/ou dispositivo físico)
- Possibilidade de extensão futura para Web e iOS

---

## 📥 Como Baixar e Testar o Projeto

### Pré-requisitos

- Flutter SDK instalado ([guia oficial](https://docs.flutter.dev/get-started/install))
- Android Studio (com emulador ou dispositivo Android conectado)
- Git

### Passos

1. Clone este repositório:

```bash
git clone https://github.com/mmendesdev/RastreIA
cd seu-repositorio
Instale as dependências do projeto:
flutter pub get
Conecte um celular com Depuração USB ativada ou inicie um emulador Android.
Rode o projeto: flutter run
