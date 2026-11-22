package ph.brgylabangon.docrequest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

/**
 * Entry point. Run this class (or "mvn spring-boot:run") to start the API on http://localhost:8080.
 * UserDetailsServiceAutoConfiguration is excluded because we log users in ourselves with JWT
 * (see security/ and AuthService), so Spring's default in-memory user is not needed.
 */
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class DocRequestApplication {
    public static void main(String[] args) {
        SpringApplication.run(DocRequestApplication.class, args);
    }
}
