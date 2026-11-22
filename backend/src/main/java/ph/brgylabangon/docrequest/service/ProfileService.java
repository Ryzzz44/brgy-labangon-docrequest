package ph.brgylabangon.docrequest.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ph.brgylabangon.docrequest.dto.AuthDtos.ResidentProfile;
import ph.brgylabangon.docrequest.dto.ProfileDtos.PasswordChange;
import ph.brgylabangon.docrequest.dto.ProfileDtos.ProfileUpdate;
import ph.brgylabangon.docrequest.entity.Resident;
import ph.brgylabangon.docrequest.exception.ApiException;
import ph.brgylabangon.docrequest.repository.ResidentRepository;
import ph.brgylabangon.docrequest.security.AuthUser;

@Service
public class ProfileService {

    private final ResidentRepository residents;
    private final PasswordEncoder passwordEncoder;

    public ProfileService(ResidentRepository residents, PasswordEncoder passwordEncoder) {
        this.residents = residents;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public ResidentProfile get(AuthUser user) {
        return ResidentProfile.from(find(user));
    }

    @Transactional
    public ResidentProfile update(AuthUser user, ProfileUpdate body) {
        Resident r = find(user);
        r.setFullName(body.fullName().trim());
        r.setAddress(body.address().trim());
        r.setContactNumber(body.contactNumber().trim());
        if (body.validIdImage() != null && body.validIdImage().startsWith("data:image/")) {
            r.setValidIdImage(body.validIdImage());
        }
        return ResidentProfile.from(r);
    }

    /**
     * The current password must be correct; the new one is stored as a BCrypt hash.
     */
    @Transactional
    public void changePassword(AuthUser user, PasswordChange body) {
        Resident r = find(user);
        if (!passwordEncoder.matches(body.currentPassword(), r.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Your current password is incorrect.");
        }
        if (body.currentPassword().equals(body.newPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "The new password must be different.");
        }
        r.setPasswordHash(passwordEncoder.encode(body.newPassword()));
    }

    private Resident find(AuthUser user) {
        return residents.findById(user.id()).orElseThrow(() -> ApiException.notFound("Resident"));
    }
}