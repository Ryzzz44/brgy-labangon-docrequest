package ph.brgylabangon.docrequest.security;

/**
 * Who is calling the API, read from the JWT token.
 * role is "RESIDENT" or "STAFF"; id is the row id in the resident or staff table.
 * In a controller, get it with: @AuthenticationPrincipal AuthUser user
 */
public record AuthUser(Long id, String role, String email, String name) {
    public boolean isStaff() {
        return "STAFF".equals(role);
    }
}
