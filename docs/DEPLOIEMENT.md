# Mettre tresser.fr en ligne en privé (Vercel Preview)

Objectif : un lien `https://…vercel.app` **visible uniquement par toi** (protection Vercel : il faut être connecté à ton compte Vercel pour l'ouvrir).
Durée : ~15 minutes. Tout est gratuit (offres « Hobby » / « Free »).

## 1. Créer le projet Vercel
1. Va sur **vercel.com** → *Sign Up* → **Continue with GitHub** (le compte qui possède `profound-pme-saas`).
2. *Add New… → Project* → importe **`profound-pme-saas`** → *Deploy*.
   > Ce premier déploiement utilise la branche `main` (l'ancienne maquette VisiIA). Tu pourras le supprimer ensuite (*Deployments → … → Delete*).

## 2. Brancher la base de données (Neon)
*Projet → Storage → Create Database → **Neon** (Postgres)* → coche **Preview** (et Production) → *Connect*.
Vercel ajoute automatiquement `DATABASE_URL` et `DATABASE_URL_UNPOOLED`.

## 3. Brancher Redis (Upstash) — limitation de débit
*Storage → Create Database → **Upstash** (Redis)* → coche **Preview** → *Connect*.
Vercel ajoute `KV_REST_API_URL` et `KV_REST_API_TOKEN` (le site les reconnaît).

## 4. E-mails de connexion (Resend)
1. Crée un compte sur **resend.com** avec **ton adresse e-mail** → *API Keys → Create API Key* (copie la clé `re_…`).
2. Sans domaine vérifié, Resend n'envoie qu'à ton adresse : parfait pour tester en privé.

## 5. Variables d'environnement
*Projet → Settings → Environment Variables* → environnement **Preview** :

| Nom | Valeur |
|---|---|
| `AUTH_SECRET` | une valeur aléatoire de 32+ caractères (bouton ci-dessous) |
| `APP_HMAC_SECRET` | une **autre** valeur aléatoire de 32+ caractères |
| `EMAIL_SERVER` | `smtps://resend:re_TACLE@smtp.resend.com:465` |
| `EMAIL_FROM` | `Tresser <onboarding@resend.dev>` |

Générateur de secrets : **https://generate-secret.vercel.app/32** (recharge la page pour la 2ᵉ valeur).
Ne mets **pas** `APP_URL` en Preview : l'adresse est détectée automatiquement.

## 6. Déployer la branche de travail
*Deployments* → trouve la branche **`claude/tresser-hair-social-commerce-4glnol`** → *⋯ → Redeploy*.
(Chaque nouveau `git push` sur cette branche redéploiera automatiquement.)
Le build applique lui-même les migrations de la base (`vercel-build`).

## 7. Vérifier que c'est privé
*Settings → Deployment Protection* → **Vercel Authentication : Standard Protection** (activé par défaut).
Ouvre le lien du déploiement dans une fenêtre privée : Vercel doit te demander de te connecter.

## 8. Tester
- Ouvre le lien (connecté à Vercel) → fais le diagnostic → *Connexion* avec **ton** e-mail → clique le lien reçu.
- Pour devenir admin : *Storage → Neon → Open in Neon → SQL Editor* :
  `UPDATE "User" SET role = 'ADMIN' WHERE email = 'ton@email.fr';`

## En cas de problème
Le build commence par une **vérification de la configuration** : ouvre le déploiement → *Building* et
regarde le bloc « Vérification de la configuration tresser.fr ». Chaque ❌ indique quoi corriger.

- **Build en erreur « Invalid environment configuration »** : une variable de l'étape 5 manque ou est trop courte.
- **Pas d'e-mail reçu** : vérifie la clé Resend et que tu utilises l'adresse de ton compte Resend.
- **« forbidden_origin »** : ouvre le site via le lien du déploiement (pas un autre domaine).
