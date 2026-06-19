<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'Exception.php';
require 'PHPMailer.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name    = trim($_POST['name'] ?? '');
    $contact = trim($_POST['contact'] ?? '');
    $role    = trim($_POST['role'] ?? '');
    $message = trim($_POST['message'] ?? '');
    $hinp    = trim($_POST['hinp'] ?? '');

    // ⚠️ ЗАМЕНИТЬ на реальную почту студии Digivision:
    $from_email  = 'noreply@digivision.records';
    $admin_email = 'CHANGE_ME@example.com';

    $mail = new PHPMailer(true);
    try {
        $mail->isMail();
        $mail->CharSet = 'UTF-8';
        $mail->setLanguage('ru');
        $mail->setFrom($from_email, 'Сайт Digivision Records');
        $mail->addAddress($admin_email, 'Digivision');
        if ($contact !== '' && strpos($contact, '@') !== false && strpos($contact, ' ') === false) {
            $mail->addReplyTo($contact, $name !== '' ? $name : 'Гость');
        }
        $mail->isHTML(true);
        $mail->Subject = 'Заявка с сайта Digivision' . ($hinp !== '' ? ' (' . $hinp . ')' : '');
        $mail->Body =
            "<h2>Новое сообщение с сайта Digivision Records</h2>" .
            (!empty($name)    ? "<p><strong>Имя:</strong> {$name}</p>" : "") .
            (!empty($role)    ? "<p><strong>Кто:</strong> {$role}</p>" : "") .
            (!empty($contact) ? "<p><strong>Связь:</strong> {$contact}</p>" : "") .
            (!empty($message) ? "<p><strong>Сообщение:</strong><br>" . nl2br(htmlspecialchars($message)) . "</p>" : "");
        $mail->AltBody = "Имя: {$name}\nКто: {$role}\nСвязь: {$contact}\nСообщение: {$message}";

        echo $mail->send() ? 'OK' : 'Ошибка отправки';
    } catch (Exception $e) {
        http_response_code(500);
        echo "Ошибка: {$mail->ErrorInfo}";
    }
} else {
    echo 'Неверный метод запроса';
}
