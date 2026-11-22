package ph.brgylabangon.docrequest.exception;

import org.springframework.http.HttpStatus;

/**
 * Throw this from a service when a rule is broken, e.g.
 *   throw new ApiException(HttpStatus.CONFLICT, "Only pending requests can be edited.");
 * GlobalExceptionHandler turns it into JSON: { "message": "..." } with that HTTP status.
 */
public class ApiException extends RuntimeException {
    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public static ApiException notFound(String what) {
        return new ApiException(HttpStatus.NOT_FOUND, what + " not found.");
    }

    public static ApiException forbidden() {
        return new ApiException(HttpStatus.FORBIDDEN, "You are not allowed to do this.");
    }
}
