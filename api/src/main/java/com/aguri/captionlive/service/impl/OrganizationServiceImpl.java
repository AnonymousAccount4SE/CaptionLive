package com.aguri.captionlive.service.impl;

import com.aguri.captionlive.DTO.OrganizationRequest;
import com.aguri.captionlive.DTO.ProjectInfo;
import com.aguri.captionlive.common.exception.EntityNotFoundException;
import com.aguri.captionlive.common.util.FileRecordUtil;
import com.aguri.captionlive.model.*;
import com.aguri.captionlive.repository.MembershipRepository;
import com.aguri.captionlive.repository.OrganizationRepository;
import com.aguri.captionlive.repository.ProjectRepository;
import com.aguri.captionlive.service.OrganizationService;
import jakarta.transaction.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrganizationServiceImpl implements OrganizationService {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Override
    public Organization getOrganizationById(Long id) {
        return organizationRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Organization not found with id: " + id));
    }

    @Override
    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }


    @Autowired
    MembershipRepository membershipRepository;

    @Override
    @Transactional
    public Organization createOrganization(OrganizationRequest organizationRequest, User user) {
        Organization organization = new Organization();
        BeanUtils.copyProperties(organizationRequest, organization);
        organization.setAvatar(FileRecordUtil.generateFileRecord(organizationRequest.getAvatarId()));
        Membership membership = new Membership();
        membership.setOrganization(organization);
        membership.setUser(user);
        membership.setPermission(Membership.Permission.LEADER);
        Organization save = organizationRepository.save(organization);
        membershipRepository.save(membership);
        return save;
    }

    @Override
    public Organization updateOrganization(Long id, OrganizationRequest organizationRequest) {
        Organization existingOrganization = getOrganizationById(id);
        existingOrganization.setName(organizationRequest.getName());
        existingOrganization.setDescription(organizationRequest.getDescription());
        existingOrganization.setAvatar(FileRecordUtil.generateFileRecord(organizationRequest.getAvatarId()));
        return organizationRepository.save(existingOrganization);
    }

    @Override
    public void deleteOrganization(Long id) {
        Organization organization = getOrganizationById(id);
        organizationRepository.delete(organization);
    }

    @Override
    public List<ProjectInfo> getPagedProjects(Long organizationId, String searchTxt, int page, int size, String sortBy, String sortOrder) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortOrder), sortBy));
        getOrganizationById(organizationId);
        Page<Project> projectsPage = projectRepository.findAllByOrganizationsOrganizationIdAndNameContaining(organizationId, searchTxt, pageable);
        List<Project> projects = projectsPage.getContent();
        return ProjectInfo.generateProjectInfos(projects);
    }

}
