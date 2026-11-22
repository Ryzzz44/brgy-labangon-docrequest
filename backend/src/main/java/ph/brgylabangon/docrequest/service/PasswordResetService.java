package ph.brgylabangon.docrequest.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ph.brgylabangon.docrequest.entity.PasswordResetToken;
import ph.brgylabangon.docrequest.entity.Resident;
import ph.brgylabangon.docrequest.exception.ApiException;
import ph.brgylabangon.docrequest.repository.PasswordResetTokenRepository;
import ph.brgylabangon.docrequest.repository.ResidentRepository;

/**
 * FR Objective 1, Transaction 1: reset a forgotten password by email.
 *  1. requestReset(email): makes a one-time link and emails it (valid for 30 minutes).
 *  2. resetPassword(token, newPassword): checks the link and saves the new password.
 * Without MAIL_HOST (class demo), the link is printed in the backend console instead of emailed.
 */
@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final String BAD_LINK = "This reset link is invalid or has expired. Please request a new one.";

    private final ResidentRepository residents;
    private final PasswordResetTokenRepository tokens;
    private final PasswordEncoder passwordEncoder;
    private final ObjectProvider<JavaMailSender> mailSender;
    private final SecureRandom random = new SecureRandom();

    @Value("${spring.mail.host:}")
    private String mailHost;
    @Value("${spring.mail.username:}")
    private String mailFrom;
    @Value("${app.frontend-url}")
    private String frontendUrl;
    @Value("${app.password-reset.minutes:30}")
    private long validMinutes;

    public PasswordResetService(ResidentRepository residents, PasswordResetTokenRepository tokens,
            PasswordEncoder passwordEncoder, ObjectProvider<JavaMailSender> mailSender) {
        this.residents = residents;
        this.tokens = tokens;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    /** Always answers the same way, so nobody can use this page to find out which emails are registered. */
    @Transactional
    public void requestReset(String email) {
        residents.findByEmailIgnoreCase(email.trim()).ifPresent(resident -> {
            // Older links stop working when a new one is requested.
            tokens.findByResidentIdAndUsedFalse(resident.getId()).forEach(t -> t.setUsed(true));

            String token = newToken();
            PasswordResetToken row = new PasswordResetToken();
            row.setResident(resident);
            row.setTokenHash(sha256(token));
            row.setExpiresAt(LocalDateTime.now().plusMinutes(validMinutes));
            tokens.save(row);

            sendEmail(resident, frontendUrl + "/?reset=" + token);
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken row = tokens.findByTokenHash(sha256(token.trim()))
                .filter(t -> !t.isUsed() && t.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, BAD_LINK));
        row.setUsed(true);
        Resident resident = row.getResident();
        resident.setPasswordHash(passwordEncoder.encode(newPassword)); // saved when the transaction ends
    }

    private void sendEmail(Resident resident, String link) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (mailHost == null || mailHost.isBlank() || sender == null) {
            log.info("[Forgot password] Email is not set up (MAIL_HOST). Reset link for {}: {}", resident.getEmail(), link);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        if (mailFrom != null && !mailFrom.isBlank()) message.setFrom(mailFrom);
        message.setTo(resident.getEmail());
        message.setSubject("Barangay Labangon: reset your password");
        message.setText("Hello " + resident.getFullName() + ",\n\n"
                + "We received a request to reset the password of your Barangay Labangon resident account.\n"
                + "Open this link within " + validMinutes + " minutes to choose a new password:\n\n"
                + link + "\n\n"
                + "If you did not ask for this, you can ignore this email. Your password stays the same.\n\n"
                + "Barangay Labangon Document Request System");
        try {
            sender.send(message);
        } catch (Exception e) {
            // Do not tell the browser (it would reveal that the email exists); log it for the developers.
            log.warn("[Forgot password] Could not send email to {}: {}", resident.getEmail(), e.getMessage());
        }
    }

    /** 32 random bytes, safe to put in a link. */
    private String newToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String sha256(String value) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
