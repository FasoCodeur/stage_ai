import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Service d'envoi d'emails via Resend (https://resend.com).
 * Configurez RESEND_API_KEY dans le .env.
 * Si la clé est absente, l'email est simulé et affiché dans la console.
 */
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly client: Resend | null = null;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.from = this.configService.get<string>('MAIL_FROM', 'StageIA <onboarding@resend.dev>');

    if (apiKey) {
      this.client = new Resend(apiKey);
      this.logger.log('Resend configuré — les emails seront envoyés via l’API Resend.');
    } else {
      this.logger.warn('RESEND_API_KEY manquante — les emails seront simulés dans la console.');
    }
  }

  private async send(options: MailOptions): Promise<void> {
    if (!this.client) {
      // Mode simulation : affiche l'email dans la console
      this.logger.log(
        `\n📧 [EMAIL SIMULÉ]\nDe    : ${this.from}\nÀ     : ${options.to}\nSujet : ${options.subject}\n${options.html}\n`,
      );
      return;
    }

    try {
      const { error } = await this.client.emails.send({
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        // On n'échoue pas la création du compte si l'email ne part pas
        this.logger.error(`Échec d'envoi d'email à ${options.to} : ${error.message}`);
        return;
      }

      this.logger.log(`Email envoyé à ${options.to} — ${options.subject}`);
    } catch (err: any) {
      this.logger.error(`Échec d'envoi d'email à ${options.to} : ${err.message}`);
    }
  }

  /**
   * Email de bienvenue envoyé à un nouveau professeur avec son mot de passe par défaut.
   */
  async sendWelcomeProfessor(to: string, name: string, email: string, defaultPassword: string): Promise<void> {
    const subject = 'Bienvenue sur StageIA — Votre compte professeur';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #3b3fb8; margin-top: 0;">Bienvenue sur StageIA, ${name} ! 🎓</h2>
        <p>Votre compte <strong>professeur</strong> vient d'être créé par l'administrateur.</p>
        <p>Voici vos identifiants de connexion :</p>
        <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
          <tr>
            <td style="padding: 8px; background: #f3f4f6; border-radius: 6px 0 0 0;"><strong>Email</strong></td>
            <td style="padding: 8px; background: #f3f4f6; border-radius: 0 6px 0 0;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f3f4f6; border-radius: 0 0 0 6px;"><strong>Mot de passe</strong></td>
            <td style="padding: 8px; background: #f3f4f6; border-radius: 0 0 6px 0; font-family: monospace; font-size: 16px;">${defaultPassword}</td>
          </tr>
        </table>
        <p style="color: #b45309; background: #fef3c7; padding: 10px; border-radius: 8px; font-size: 14px;">
          ⚠️ Ce mot de passe est provisoire. Pensez à le changer rapidement depuis votre espace
          (menu de votre profil → « Changer le mot de passe »).
        </p>
        <p style="font-size: 14px; color: #6b7280;">
          À très vite sur StageIA — la plateforme de formation &amp; stages virtuels.
        </p>
      </div>
    `;
    await this.send({ to, subject, html });
  }

  /**
   * Email de bienvenue envoyé à une entreprise partenaire avec les identifiants
   * de son compte d'accès (rôle tuteur).
   */
  async sendWelcomeEntreprise(to: string, nom: string, email: string, defaultPassword: string): Promise<void> {
    const subject = 'Bienvenue sur StageIA — Votre espace entreprise partenaire';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #3b3fb8; margin-top: 0;">Bienvenue sur StageIA, ${nom} ! 🏢</h2>
        <p>Votre entreprise partenaire vient d'être enregistrée par l'administrateur.</p>
        <p>Voici les identifiants de connexion de votre espace entreprise :</p>
        <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
          <tr>
            <td style="padding: 8px; background: #f3f4f6; border-radius: 6px 0 0 0;"><strong>Email</strong></td>
            <td style="padding: 8px; background: #f3f4f6; border-radius: 0 6px 0 0;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f3f4f6; border-radius: 0 0 0 6px;"><strong>Mot de passe</strong></td>
            <td style="padding: 8px; background: #f3f4f6; border-radius: 0 0 6px 0; font-family: monospace; font-size: 16px;">${defaultPassword}</td>
          </tr>
        </table>
        <p style="color: #b45309; background: #fef3c7; padding: 10px; border-radius: 8px; font-size: 14px;">
          ⚠️ Ce mot de passe est provisoire. Pensez à le modifier dès votre première connexion.
        </p>
        <p style="font-size: 14px; color: #6b7280;">
          Depuis votre espace, vous pouvez publier des offres de stage, créer des utilisateurs
          pour suivre vos stagiaires et échanger avec les mentors.
        </p>
        <p style="font-size: 12px; color: #9ca3af; margin-bottom: 0;">
          StageIA — la plateforme de formation &amp; stages virtuels.
        </p>
      </div>
    `;
    await this.send({ to, subject, html });
  }

  /**
   * Email contenant le lien de réinitialisation du mot de passe.
   */
  async sendPasswordReset(to: string, name: string, resetUrl: string): Promise<void> {
    const subject = 'StageIA — Réinitialisation de votre mot de passe';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #3b3fb8; margin-top: 0;">Réinitialisation du mot de passe</h2>
        <p>Bonjour ${name},</p>
        <p>Vous avez demandé à réinitialiser le mot de passe de votre compte StageIA.</p>
        <p style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}"
             style="background: #3b3fb8; color: #ffffff; text-decoration: none; padding: 14px 26px; border-radius: 10px; font-weight: bold; display: inline-block;">
            Choisir un nouveau mot de passe
          </a>
        </p>
        <p style="font-size: 13px; color: #6b7280;">
          Ce lien est valable <strong>1 heure</strong>. Si vous n'êtes pas à l'origine de cette demande,
          vous pouvez ignorer cet email : votre mot de passe restera inchangé.
        </p>
        <p style="font-size: 12px; color: #9ca3af; word-break: break-all;">
          Lien direct : ${resetUrl}
        </p>
      </div>
    `;
    await this.send({ to, subject, html });
  }

  /**
   * Prévient un administrateur qu'un cours manquant a été suggéré par l'IA.
   */
  async sendCourseSuggestion(
    to: string,
    name: string,
    suggestion: {
      titre: string;
      category: string;
      level: string;
      justification: string;
      competences: string[];
    },
  ): Promise<void> {
    const subject = 'StageIA — Un cours manquant a été suggéré';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #3b3fb8; margin-top: 0;">Cours manquant détecté par l'IA 💡</h2>
        <p>Bonjour ${name},</p>
        <p>L'IA a détecté qu'un cours nécessaire à la progression des étudiants n'existe pas encore sur la plateforme :</p>
        <table style="width: 100%; border-collapse: collapse; margin: 12px 0;">
          <tr>
            <td style="padding: 8px; background: #f3f4f6;"><strong>Titre proposé</strong></td>
            <td style="padding: 8px; background: #f3f4f6;">${suggestion.titre}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f9fafb;"><strong>Catégorie</strong></td>
            <td style="padding: 8px; background: #f9fafb;">${suggestion.category} · ${suggestion.level}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f3f4f6;"><strong>Compétences</strong></td>
            <td style="padding: 8px; background: #f3f4f6;">${suggestion.competences.join(', ') || '—'}</td>
          </tr>
        </table>
        <p style="background: #eef2ff; padding: 12px; border-radius: 8px; font-size: 14px;">
          <strong>Pourquoi ?</strong> ${suggestion.justification}
        </p>
        <p style="font-size: 14px; color: #6b7280;">
          Connectez-vous à l'espace administrateur → « Suggestions IA » pour créer ce cours ou le refuser.
        </p>
      </div>
    `;
    await this.send({ to, subject, html });
  }
}

