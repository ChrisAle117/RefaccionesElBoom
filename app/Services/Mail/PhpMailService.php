<?php

namespace App\Services\Mail;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;
use Illuminate\Support\Facades\Log;

class PhpMailService
{
    protected array $cfg;

    public function __construct()
    {
        $this->cfg = config('services.phpmailer');
    }

    public function send(
        string $toEmail,
        ?string $toName,
        string $subject,
        string $htmlBody,
        array $attachments = [],
        array $cc = [],
        array $bcc = []
    ): bool {
        $mail = new PHPMailer(true);

        try {
            // SMTP
            $mail->isSMTP();
            $mail->SMTPAuth   = true;
            $mail->Host       = $this->cfg['host'];
            $mail->Port       = (int)$this->cfg['port'];
            $mail->SMTPSecure = $this->cfg['encryption'];
            $mail->Username   = $this->cfg['username'];
            $mail->Password   = $this->cfg['password'];

            // From / To
            $mail->setFrom($this->cfg['from']['address'], $this->cfg['from']['name']);
            $mail->addAddress($toEmail, $toName ?? '');

            // CC/BCC opcional
            foreach ($cc as $k => $v) { is_string($k) ? $mail->addCC($k, $v) : $mail->addCC($v); }
            foreach ($bcc as $k => $v) { is_string($k) ? $mail->addBCC($k, $v) : $mail->addBCC($v); }

            // Contenido
            $mail->CharSet = 'UTF-8';
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $htmlBody;

            // Adjuntos: path o en memoria
            foreach ($attachments as $att) {
                if (is_string($att)) {
                    $mail->addAttachment($att);
                } elseif (is_array($att) && isset($att['data'], $att['name'])) {
                    $mail->addStringAttachment(
                        $att['data'],
                        $att['name'],
                        'base64',
                        $att['mime'] ?? 'application/pdf'
                    );
                }
            }

            return $mail->send();
        } catch (PHPMailerException $e) {
            Log::error('PHPMailer error: '.$e->getMessage());
            return false;
        } catch (\Throwable $e) {
            Log::error('Mailer general error: '.$e->getMessage());
            return false;
        }
    }
}
