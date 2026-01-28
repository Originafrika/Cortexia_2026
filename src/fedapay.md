# FedaPay Documentation

## Vue d'ensemble
L'intégration de FedaPay dans votre application ou votre site web ne nécessitant que trois étapes, peut commencer dès que vous créez un compte FedaPay :

1. Obtenez vos clés API afin que FedaPay puisse authentifier vos requêtes API
2. Installez une librairie API afin que votre intégration puisse interagir avec FedaPay
3. Faites un test de requêtes API pour vous assurer que tout est en place et fonctionne bien

## Etape 1: Obtenir vos clés API
FedaPay authentifie vos requêtes à l'aide des clés API de votre compte. Si vous n'incluez pas votre clé lorsque vous effectuez une requête ou si vous utilisez une clé incorrecte ou obsolète, FedaPay renvoie une erreur.

Chaque compte est fourni avec deux clés: une pour les tests et une pour les transactions en live. Toutes les requêtes via l'API existent en mode test ou en mode live, et les objets (clients, transactions) dans un mode ne peuvent pas être manipulés par des objets dans l'autre.

Vos clés API sont disponibles au niveau du tableau de bord de votre compte. Nous incluons des clés API générées aléatoirement dans nos exemples de code. Remplacez-les par les vôtres.

## Etape 2: Installer une librairie API
Nous fournissons des librairies pour différents langages de programmation et plates-formes mobiles.

### PHP
La librairie PHP peut être installé via Composer

```bash
composer require fedapay/fedapay-php
```

Consultez la documentation de l'API ou la source PHP sur GitHub.

### NodeJs
```bash
npm install fedapay
```

## Etape 3: Faire un test de requêtes API
Pour vérifier que votre intégration fonctionne correctement, effectuez un test de requêtes via l'API à l'aide de votre clé secrète de test pour créer une transaction.

```bash
curl -X POST \
  https://sandbox.fedapay.com/v1/transactions \
  -H 'Authorization: Bearer VOTRE_CLE_API' \
  -H 'Content-Type: application/json' \
  -d '{
        "description" : "Transaction for john.doe@example.com",
        "amount" : 2000,
        "currency" : {"iso" : "XOF"},
        "callback_url" : "https://maplateforme.com/callback",
        "customer" : {
            "firstname" : "John",
            "lastname" : "Doe",
            "email" : "john.doe@example.com",
            "phone_number" : {
                "number" : "+22997808080",
                "country" : "bj"
            }
          }
      }'
```

FedaPay retourne un objet transaction en réponse à votre requête.

## Événements

### Le cycle de vie des transactions

Le système démarre avec la création d'un client, cet événement est appelé `customer.created`. Puis une transaction est créée et affectée au client qui vient d'être créé. C'est l'événement `transaction.created`.

Une fois cette transaction créée, elle peut être:
- Annulée (`transaction.canceled`)
- Déclinée (`transaction.declined`)
- Approuvée (`transaction.approved`)
- Ensuite transférée (`transaction.transferred`)

Chaque événement étant accompagné d'une mise à jour immédiate de statut (`transaction.updated`).

Le principe est le même pour les clients. Vous avez aussi les événements:
- `customer.updated`
- `customer.deleted`

Retrouvez l'historique détaillé de tous les événements sur votre compte FedaPay au niveau de la section Événements.

## Webhooks

FedaPay peut envoyer des webhooks qui notifient à votre application chaque fois qu'un événement se produit sur votre compte. Cela est particulièrement utile pour les événements tels que les transactions contestées ou réussies.

### Configurer les paramètres de vos webhooks

Les webhooks sont configurés dans la section Webhooks du tableau de bord. Cliquez sur Créer un webhook ou Nouveau webhook pour afficher un formulaire dans lequel vous pouvez ajouter une nouvelle URL pour recevoir des webhooks.

### Vérification des signatures Webhook

FedaPay signe les événements Webhook qu'il envoie à votre noeud final. Nous le faisons en incluant une signature dans l'en-tête de chaque événement `X-FEDAPAY-SIGNATURE`.

#### Vérification des signatures à l'aide de nos bibliothèques officielles

```php
// You can find your endpoint's secret key in your webhook settings
$endpoint_secret = 'wh_dev.......';

$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_X_FEDAPAY_SIGNATURE'];
$event = null;

try {
    $event = \FedaPay\Webhook::constructEvent(
        $payload, $sig_header, $endpoint_secret
    );
} catch(\UnexpectedValueException $e) {
    // Invalid payload
    http_response_code(400);
    exit();
} catch(\FedaPay\Error\SignatureVerification $e) {
    // Invalid signature
    http_response_code(400);
    exit();
}

// Handle the event
switch ($event->name) {
    case 'transaction.created':
        // Transaction créée
        break;
    case 'transaction.approved':
        // Transaction approuvée
        break;
    case 'transaction.canceled':
        // Transaction annulée
        break;
    default:
        http_response_code(400);
        exit();
}

http_response_code(200);
```

## Logs

Cette section au niveau de votre tableau de bord, vous permet de retracer toutes les requêtes que vous avez émises avec leur détail respectif.

## Clés API et Librairies

### Clés

FedaPay authentifie vos requêtes via l'API à l'aide des clés API de votre compte.

Chaque compte est fourni avec deux paires de clés: une pour les tests et une pour les transactions en live.

Il existe également deux types de clés API: publique et secrète.

- **Les clés API publiques** sont uniquement destinées à identifier votre compte avec FedaPay, elles ne sont pas secrètes. Elles peuvent être publiées en toute sécurité dans des endroits comme votre code JavaScript, ou dans une application Android ou iPhone. Les clés publiques servent uniquement à créer des token.
- **Les clés API secrètes** doivent rester confidentielles et stockées uniquement sur vos propres serveurs. La clé API secrète de votre compte peut effectuer n'importe quelle requête API vers FedaPay sans restriction.

### Obtenir vos clés API

Vos clés API sont disponibles au niveau de votre tableau de bord.

N'utilisez uniquement que vos clés API de test pour les tests et le développement. Cela vous protège des modifications accidentelles de vos clients ou transactions.

### Sécuriser vos clés

Votre clé API secrète peut être utilisée pour effectuer une opération au nom de votre compte. Vous ne devez accorder l'accès à vos clés API qu'à ceux qui en ont besoin. Assurez-vous qu'elles sont hors de tout système de contrôle de version que vous utilisez.

### Régénérer les clés

Si une clé API est compromise, régénérez de nouvelles clés, pour la bloquer et la rendre inutilisable au niveau de votre tableau de bord.

## API Documentation

### Authorization

Authentifiez votre compte lorsque vous utilisez l'API en incluant votre clé API secrète dans la demande. L'authentification à l'API est effectuée via les entêtes HTTP.

### Sessions

Authentifiez votre compte lorsque vous voulez gérer un panel d'administration. Un token vous sera retourné. Vous devez l'inclure dans l'entête de toutes vos requêtes sécurisées.

### Customers

Les objects customer vous permettent d'effectuer des frais récurrents et de suivre les frais multiples associés au même client.

#### List all customers
```bash
GET /customers
```

#### Create a customer
```bash
POST /customers
```

#### Update a customer
```bash
PUT /customers/{id}
```

#### Retrieve a customer
```bash
GET /customers/{id}
```

#### Delete a customer
```bash
DELETE /customers/{id}
```

### Transactions

Pour effectuer une transaction, vous créez un objet de frais. Vous pouvez récupérer et supprimer les transactions individuels ainsi que la liste de toutes les transactions.

#### List all transactions
```bash
GET /transactions
```

#### Create a transaction
```bash
POST /transactions
```

#### Retrieve a transaction
```bash
GET /transactions/{id}
```

#### Delete a transaction
```bash
DELETE /transactions/{id}
```

### Events

Les événements sont notre façon de vous informer lorsque quelque chose d'intéressant se produit dans votre compte.

#### List all events
```bash
GET /events
```

#### Retrieve an event
```bash
GET /events/{id}
```

### Pagination

Les requêtes qui retournent plusieurs éléments seront paginées à 25 éléments par défaut. Vous pouvez spécifier d'autres pages avec le paramètre `page`. Vous pouvez également définir une taille de page personnalisée jusqu'à 100 avec le paramètre `per_page`.

## Sécurisation des applications

### Utilisation du TLS / HTTPS

TLS (Transport Layer Security) fait référence au processus de transmission sécurisée de données entre le client et votre serveur. Les pages de paiement doivent utiliser une version moderne de TLS (par exemple, TLS 1.2).

### Mise en place du TLS/HTTPS

Un certificat numérique, fichier émis par une autorité de certification (CA) est nécessaire pour utiliser TLS. Vous devriez opter pour un certificat numérique d'un fournisseur de certificat réputé, tel que:
- Let's encrypt
- DigiCert
- NameCheap

## Sécurité de compte

### Protection de mot de passe par hachage

Cette méthode permet de chiffrer une chaîne de caractères sans possibilité d'inverser cette opération.

### Hasher les mots de passe avec des « salts »

Cette technique consiste en la concaténation d'une ou plusieurs clés (appelées aussi « salt », «seed» ou «graine») avec le mot de passe, puis le hachage de la chaîne ainsi créée.

### Choix du mot de passe

Pour la sécurité de votre compte marchand, respectez ces recommandations:
- Utilisez un mot de passe dense (au moins 8 caractères composé de chiffres et de caractères en majuscules et minuscules)
- Évitez d'utiliser le même mot de passe sur plusieurs comptes différents
- Évitez de communiquer votre mot de passe à qui que ce soit
- Pensez à changer votre mot de passe aussi souvent que vous le souhaitez

## Gestion de fraudes

### Côté marchand
Chaque transaction est contrôlée et validée par le système afin de détecter les activités douteuses.

### Côté acheteur
Lorsqu'un client effectue un achat, notre système vérifie l'authenticité des informations. Toute fausse information entraîne le refus de la transaction.

## Démarrage rapide

### Feda Direct

Si vous utilisez Feda Direct, vous pouvez simplement envoyer un lien de paiement à votre client depuis l'interface du tableau de bord.

#### Etape 1: Créer le client
Créez un client depuis l'interface du tableau de bord en renseignant son nom, prénom, email et numéro de téléphone.

#### Etape 2: Créer une transaction
Créez une transaction en renseignant le montant, un lien de retour (facultatif) et une description.

#### Etape 3: Générer un lien de paiement
Générez un lien de paiement que vous envoyez au destinataire. Ce lien est valable pendant 24 heures.

### Feda Commerce

Si vous comptez utiliser Feda Commerce, utilisez Feda Checkout pour accepter les paiements depuis votre site web ou application mobile.

## Checkout.js

Feda Checkout est le moyen le plus facile et rapide pour intégrer un formulaire de paiement à votre site.

### Ajout d'un bouton à votre page

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
  <title>Intégrer Feda Checkout à mon site</title>
  <script src="https://cdn.fedapay.com/checkout.js?v=1.1.7"></script>
</head>
<body>
  <button id="pay-btn">Payer 100 FCFA</button>
  <script type="text/javascript">
      FedaPay.init('#pay-btn', { public_key: 'VOTRE_CLE_API_PUBLIQUE' });
  </script>
</body>
</html>
```

### Options additionnelles

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <script src="https://cdn.fedapay.com/checkout.js?v=1.1.7"></script>
</head>
<body>
  <button id="pay-btn">Payer 1000 FCFA</button>
  <script type="text/javascript">
      FedaPay.init('#pay-btn', {
        public_key: 'VOTRE_CLE_API_PUBLIQUE',
        transaction: {
          amount: 1000,
          description: 'Acheter mon produit'
        },
        customer: {
          email: 'johndoe@gmail.com',
          lastname: 'Doe',
          firstname: 'John',
        }
      });
  </script>
</body>
</html>
```

### Intégration embarquée

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <script src="https://cdn.fedapay.com/checkout.js?v=1.1.7"></script>
</head>
<body>
  <div id="embed" style="width: 500px; height: 420px"></div>

  <script type="text/javascript">
      FedaPay.init({
        public_key: 'VOTRE_CLE_API_PUBLIQUE',
        transaction: {
          amount: 1000,
          description: 'Acheter mon produit'
        },
        customer: {
          email: 'johndoe@gmail.com',
          lastname: 'Doe',
        },
        container: '#embed'
     });
  </script>
</body>
</html>
```

## FedaPay Me

FedaPay Me vous permet de créer votre page de paiement entièrement personnalisable et d'obtenir un lien unique pour recevoir tous vos paiements.

## Transactions

### Créer des transactions

La création d'une transaction se fait en plusieurs processus:

1. **Requête de création de la transaction**
2. **Générer le token et le lien de paiement**
3. **Redirection vers la page de paiement**
4. **Lien de retour (callback_url)**
5. **Récupération des détails d'une transaction**

### Faire un paiement sans redirection

Il est possible de faire des paiements sans rediriger l'utilisateur vers la page de paiement. Cependant, cela n'est possible que pour certains moyens de paiement comme MTN Bénin, Moov Bénin, Moov Togo, et MTN Côte d'ivoire.

### Cycle de vie des transactions

Les statuts d'une transaction:
- **pending**: En attente
- **approved**: Approuvée
- **declined**: Déclinée
- **canceled**: Annulée
- **refunded**: Remboursée
- **transferred**: Transférée

## Remboursements

Pour tout problème lié à une transaction, il est possible de rembourser le montant payé. Les remboursements ne sont actuellement possibles qu'avec MTN Mobile Money et ne peuvent s'effectuer que depuis le tableau de bord.

## Récupérer vos gains

Toutes les transactions portant la mention Transférée sont disponibles sur la balance de votre compte marchand. Pour entrer en possession des fonds, vous pouvez:
- Ajouter un compte bancaire
- Ajouter un numéro mobile money
- Ajouter une carte bancaire

## Transferts (Payouts)

### Créer des dépôts

Un dépôt est un versement que vous effectuez sur le compte d'un client depuis votre balance.

```bash
curl -X POST \
https://sandbox-api.fedapay.com/v1/payouts \
-H 'Authorization: Bearer VOTRE_CLE_API_PRIVEE' \
-H 'Content-Type: application/json' \
-d '{
      "amount" : 2000,
      "currency" : {"iso" : "XOF"},
      "mode": "mtn_open",
      "customer" : {
          "firstname" : "John",
          "lastname" : "Doe",
          "email" : "john.doe@example.com",
          "phone_number" : {
              "number" : "+22997808080",
              "country" : "bj"
          }
      }
    }'
```

### Cycle de vie des dépôts

Les statuts d'un dépôt:
- **pending**: En attente
- **started**: Démarré
- **processing**: En cours d'envoi
- **sent**: Envoyé
- **failed**: Échoué

## Devises supportées

### Tableau des devises supportées

| ISO | Numéro ISO (code) | Devise | Pays |
|-----|-------------------|--------|------|
| XOF | 952 | Franc CFA (UEMOA) | Communauté Financière Africaine BCEAO |

### Règle d'utilisation des devises

- Toutes les requêtes via l'API doivent avoir en paramètre pour la devise soit son ISO en caractères majuscules ou son numéro ISO
- Pour le montant de la transaction, veuillez toujours l'indiquer en le multipliant par cent pour les devises utilisant les centimes
- Pour les devises n'utilisant pas les centimes comme le Franc CFA, indiquez simplement le montant sans multiplication

## Méthodes de paiement

### Tableau des méthodes de paiement supportées

| Pays | Méthodes de paiement | Devises utilisables |
|------|---------------------|---------------------|
| Bénin | MTN Mobile Money, MOOV Money, CELTIIS Cash, CORIS Money, BMO | Franc CFA |
| Côte d'Ivoire | MTN Mobile Money, Moov Money, Orange Money, Wave | Franc CFA |
| Niger | Airtel Money | Franc CFA |
| Sénégal | Orange Money, Wave | Franc CFA |
| Togo | MOOV Money, TOGOCEL T-Money | Franc CFA |
| Mali | Orange Money | Franc CFA |
| Burkina-Faso | MOOV Money, Orange Money | Franc CFA |
| Guinée | MTN Mobile Money | Franc guinéen |
| Partout | Visa/MasterCard | Franc CFA & Franc guinéen |

### Cartes bancaires

Le client peut effectuer son paiement en toute sécurité avec sa carte Visa ou MasterCard.

### Mobile Money

Le client reçoit une notification directement sur son téléphone lui demandant d'approuver le paiement en saisissant son code PIN secret.

## Test

### Numéros de carte test

| Numéro | Type de carte | Scénario |
|--------|---------------|----------|
| 4111111111111111 | Visa | succès |
| 4242424242424241 | Visa | échec |
| 5555555555554444 | MasterCard | succès |
| 4242424242424242 | Visa | échec |

### Numéros de téléphone test

| Numéro | Opérateur GSM | Scénario |
|--------|---------------|----------|
| 66000001 | MTN Bénin | succès |
| 66000000 | MTN Bénin | échec |
| 64000001 | MOOV Bénin | succès |
| 64000000 | MOOV Bénin | échec |

### Remarques

- FedaPay a prévu deux serveurs: un pour les tests et un pour le live
- En mode test, toutes vos requêtes doivent être adressées avec les clés API test
- En production, remplacez les clés API test par les clés API live
