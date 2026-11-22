package ph.brgylabangon.docrequest.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Creates and checks login tokens (JWT).
 * After login the browser keeps the token and sends it as "Authorization: Bearer <token>".
 * The token is signed with app.jwt.secret, so it cannot be faked or edited by the user.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final Duration lifetime;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-hours}") long hours) {
        if (secret.length() < 32) {
            throw new IllegalStateException("app.jwt.secret must be at least 32 characters");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.lifetime = Duration.ofHours(hours);
    }

    public String createToken(AuthUser user) {
        Date now = new Date();
        return Jwts.builder()
                .subject(String.valueOf(user.id()))
                .claim("role", user.role())
                .claim("email", user.email())
                .claim("name", user.name())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + lifetime.toMillis()))
                .signWith(key)
                .compact();
    }

    /** Returns the user inside a valid token; throws if the token is fake or expired. */
    public AuthUser parseToken(String token) {
        Claims c = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        return new AuthUser(
                Long.valueOf(c.getSubject()),
                c.get("role", String.class),
                c.get("email", String.class),
                c.get("name", String.class));
    }
}
