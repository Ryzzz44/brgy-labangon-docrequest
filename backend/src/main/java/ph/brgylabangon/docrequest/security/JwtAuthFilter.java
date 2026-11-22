package ph.brgylabangon.docrequest.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import ph.brgylabangon.docrequest.config.DemoAccounts;

/**
 * Runs once on every request. If there is a valid "Bearer" token, it tells Spring Security
 * who the user is and gives them ROLE_RESIDENT or ROLE_STAFF. Without a valid token the
 * request continues as anonymous, and SecurityConfig decides whether that is allowed.
 *
 * Demo mode (app.demo-mode=true): a request WITHOUT a token to /api/resident/** acts as the demo
 * resident, and to /api/staff/** as the first staff account. A real token always wins.
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final DemoAccounts demo;

    public JwtAuthFilter(JwtService jwtService, DemoAccounts demo) {
        this.jwtService = jwtService;
        this.demo = demo;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                signIn(jwtService.parseToken(header.substring(7)));
            } catch (Exception ignored) {
                // Invalid or expired token: stay anonymous; protected endpoints will answer 401.
                SecurityContextHolder.clearContext();
            }
        } else if (demo.isEnabled()) {
            String path = request.getRequestURI();
            if (path.startsWith("/api/resident/") && demo.getResident() != null) signIn(demo.getResident());
            else if (path.startsWith("/api/staff/") && demo.getStaff() != null) signIn(demo.getStaff());
        }
        chain.doFilter(request, response);
    }

    private void signIn(AuthUser user) {
        var auth = new UsernamePasswordAuthenticationToken(
                user, null, List.of(new SimpleGrantedAuthority("ROLE_" + user.role())));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
