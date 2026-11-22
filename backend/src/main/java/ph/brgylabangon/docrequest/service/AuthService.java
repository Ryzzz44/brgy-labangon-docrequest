package ph.brgylabangon.docrequest.service;

import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ph.brgylabangon.docrequest.dto.AuthDtos.*;
import ph.brgylabangon.docrequest.entity.Resident;
import ph.brgylabangon.docrequest.entity.Staff;
import ph.brgylabangon.docrequest.exception.ApiException;
import ph.brgylabangon.docrequest.repository.ResidentRepository;
import ph.brgylabangon.docrequest.repository.StaffRepository;
import ph.brgylabangon.docrequest.security.AuthUser;
import ph.brgylabangon.docrequest.security.JwtService;

/** Registration and login for residents and staff. */
@Service
public class AuthService {

    /** Same message for "no such email" and "wrong password", so attackers cannot guess emails. */
    private static final String BAD_LOGIN = "Incorrect email or password.";

    private final ResidentRepository residentRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(ResidentRepository residentRepository, StaffRepository staffRepository,
                       PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.residentRepository = residentRepository;
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (residentRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }
        if (!req.validIdImage().startsWith("data:image/")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please upload a photo of your valid ID.");
        }
        Resident r = new Resident();
        r.setFullName(req.fullName().trim());
        r.setEmail(email);
        r.setPasswordHash(passwordEncoder.encode(req.password()));
        r.setAddress(req.address().trim());
        r.setContactNumber(req.contactNumber().trim());
        r.setValidIdImage(req.validIdImage());
        r.setConsentVersion(req.consentVersion());
        r.setConsentAt(LocalDateTime.now());
        residentRepository.save(r);
        return residentResponse(r);
    }

    public AuthResponse loginResident(LoginRequest req) {
        Resident r = residentRepository.findByEmailIgnoreCase(req.email().trim())
                .filter(x -> passwordEncoder.matches(req.password(), x.getPasswordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, BAD_LOGIN));
        return residentResponse(r);
    }

    public AuthResponse loginStaff(LoginRequest req) {
        Staff s = staffRepository.findByEmailIgnoreCase(req.email().trim())
                .filter(x -> passwordEncoder.matches(req.password(), x.getPasswordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, BAD_LOGIN));
        String token = jwtService.createToken(new AuthUser(s.getId(), "STAFF", s.getEmail(), s.getFullName()));
        return new AuthResponse(token, "STAFF", StaffProfile.from(s));
    }

    /** Used when the page reloads: turns a saved token back into the full profile. */
    public AuthResponse me(AuthUser user, String token) {
        if (user.isStaff()) {
            Staff s = staffRepository.findById(user.id()).orElseThrow(() -> ApiException.notFound("Staff"));
            return new AuthResponse(token, "STAFF", StaffProfile.from(s));
        }
        Resident r = residentRepository.findById(user.id()).orElseThrow(() -> ApiException.notFound("Resident"));
        return new AuthResponse(token, "RESIDENT", ResidentProfile.from(r));
    }

    private AuthResponse residentResponse(Resident r) {
        String token = jwtService.createToken(new AuthUser(r.getId(), "RESIDENT", r.getEmail(), r.getFullName()));
        return new AuthResponse(token, "RESIDENT", ResidentProfile.from(r));
    }
}
