import type { Role } from "@prisma/client";

export const AGREEMENT_EFFECTIVE_DATE = "2026-09-19T00:00:00.000Z";
export const AGREEMENT_VERSION = "1.0";

export const AGREEMENTS: Record<Exclude<Role, "ADMIN">, { title: string; content: string; documentIdentifier: string }> = {
  HOMEOWNER: { title: "Member Terms & Conditions", documentIdentifier: "sturdiHome-member-terms-1-v1.0", content: `MEMBER TERMS & CONDITIONS
WEBSITE TERMS & CONDITIONS
Effective Date: September 19, 2026
Version: 1.0
IMPORTANT: These Terms govern use of the SturdiHome Network platform. They are intended as operational website terms and do not replace any separate contract, financing agreement, service contract, or legally required disclosure.
1. Purpose and Platform Role
SturdiHome Network LLC (“SturdiHome”) operates a referral and coordination platform that connects homeowners and other eligible users with independent home-service vendors and, when available, independent financing partners. SturdiHome is not a lender and does not promise approval, funding, pricing, project completion, or any particular result.
2. Account and Information
You agree to provide accurate, current information and to keep your login credentials secure. You may not impersonate another person, misuse another account, submit false documents, or use the platform for unlawful or fraudulent activity.
3. Homeowner and Referred-Customer Access
Some services may be designed for homeowners. SturdiHome may also permit a customer referred by a participating vendor to create an account for the limited purpose of accessing eligible platform services, including financing options. A vendor referral does not guarantee financing and does not give the referring vendor access to the customer’s private financial information.
4. Home Services
Vendors are independent businesses and are not employees or agents of SturdiHome. Members are responsible for reviewing a vendor’s scope, pricing, credentials, contract, warranties, permits, and work before hiring the vendor. SturdiHome may collect vendor documentation but does not guarantee a vendor’s work.
5. Financing Options
Financing products are offered, underwritten, approved, denied, funded, serviced, and governed by independent financing partners. SturdiHome does not make credit decisions and does not guarantee approval or terms. Any financing agreement is between you and the applicable financing provider.
6. Privacy and Data
You authorize SturdiHome to use information you provide as reasonably necessary to operate the platform, process your requests, coordinate referrals, maintain records, prevent misuse, and comply with law. Sensitive information should be shared only through approved platform channels.
7. Acceptable Use
You may not interfere with the platform, scrape or harvest data, bypass security, misuse another person’s information, upload malicious content, harass users, or use SturdiHome for deceptive, illegal, or unauthorized purposes.
8. Suspension and Termination
SturdiHome may restrict or terminate access for violations of these Terms, suspected fraud, security concerns, misuse of the platform, noncompliance with applicable requirements, or conduct that creates material risk to users or SturdiHome. You may stop using the platform at any time.
9. Changes to Terms
SturdiHome may update these Terms. When required or appropriate, a new version will be presented for acceptance before continued use of affected platform features.
10. Contact
Questions about these Terms may be directed to SturdiHome Network LLC through the contact information provided on the SturdiHome website.
Electronic Acceptance
By selecting “I Agree,” creating or continuing to use a member account, or using the SturdiHome platform after these Terms are presented, you acknowledge that you have read and agree to these Terms. SturdiHome may keep an electronic record of the version accepted, date and time of acceptance, account identifier, and related audit information.
PRINTABLE ACKNOWLEDGMENT
Printed Name
                                   
Signature
                                   
Date
                                   
Account / Company
                                   ` },
  VENDOR: { title: "Vendor Terms & Conditions", documentIdentifier: "sturdiHome-vendor-terms-v1.0", content: `VENDOR TERMS & CONDITIONS
WEBSITE TERMS & CONDITIONS
Effective Date: September 19, 2026
Version: 1.0
IMPORTANT: These Terms govern use of the SturdiHome Network platform. They are intended as operational website terms and do not replace any separate contract, financing agreement, service contract, or legally required disclosure.
1. Purpose and Relationship
These Terms govern a vendor’s use of the SturdiHome platform. Vendors are independent businesses, not employees, partners, joint venturers, or agents of SturdiHome. Each vendor controls its own estimates, pricing, scheduling, contracts, employees, taxes, licensing, insurance, and performance of services.
2. Vendor Eligibility and Records
Vendors must provide accurate business information and any licenses, certificates of insurance, tax/business information, certifications, or other records requested for platform participation. Vendors must keep required information current and notify SturdiHome of material changes.
3. Fees
The current vendor setup fee is $199 and includes the first 12 months of platform participation. SturdiHome does not take a percentage of a vendor’s job price and does not operate a job-bidding system. Any future recurring platform fee or material pricing change will be disclosed before it applies.
4. Leads and Customer Choice
SturdiHome may present participating vendors to users based on service category, location, availability, or other platform criteria. SturdiHome does not guarantee any number of leads, appointments, jobs, revenue, or customer selections. Customers choose whether to contact or hire a vendor.
5. Vendor-Referred Customers
A vendor may invite an outside customer to create a SturdiHome account when that customer wants to explore services available through the platform, including financing options. The customer’s SturdiHome account and financing process remain separate from the vendor. The vendor may not obtain or attempt to obtain private financial information unless independently authorized and legally permitted.
6. Customer Information and Privacy
Vendor access to customer information is limited to information reasonably necessary for the permitted service relationship. Vendors may not sell, misuse, disclose, scrape, retain beyond legitimate need, or use SturdiHome customer information for unauthorized purposes.
7. Conduct and Compliance
Vendors must comply with applicable laws, licensing rules, insurance requirements, advertising rules, safety obligations, and consumer-protection requirements. Vendors may not misrepresent affiliation with SturdiHome, promise financing approval, discriminate unlawfully, engage in deceptive practices, or use the platform for unlawful activity.
8. No Financing Authority
Unless separately authorized by a financing provider and permitted by law, a vendor may not represent that it is SturdiHome’s lender, make credit decisions on SturdiHome’s behalf, guarantee financing, or access a customer’s confidential financing application.
9. Platform Suspension or Removal
SturdiHome may suspend or remove a vendor for expired or missing required records, nonpayment of disclosed platform fees, material customer complaints, fraud, safety concerns, misuse of customer data, legal or licensing issues, platform abuse, or violation of these Terms. SturdiHome may investigate reported violations before or after restricting access.
10. No Circumvention of Platform Security
Vendors may not bypass account controls, security restrictions, approval workflows, or data-access limitations. Nothing in these Terms prevents a vendor from serving its own independently obtained customers; however, access to SturdiHome features must occur through authorized platform processes.
11. Changes and Termination
SturdiHome may update these Terms and may discontinue or modify platform features. A vendor may stop participating subject to any outstanding payment, customer, data-retention, or other obligations that survive termination.
12. Contact
Questions about vendor platform terms may be directed to Felicia@SturdiHomeNetwork.com.
Electronic Acceptance
By selecting “I Agree,” creating or continuing to use a vendor account, or using the SturdiHome platform after these Terms are presented, you acknowledge that you have read and agree to these Terms. SturdiHome may keep an electronic record of the version accepted, date and time of acceptance, account identifier, and related audit information.
PRINTABLE ACKNOWLEDGMENT
Printed Name
                                   
Signature
                                   
Date
                                   
Account / Company
                                   ` },
  FINANCING_PARTNER: { title: "Finance Partner Terms & Conditions", documentIdentifier: "sturdiHome-finance-partner-terms-v1.0", content: `FINANCE PARTNER TERMS & CONDITIONS
WEBSITE TERMS & CONDITIONS
Effective Date: September 19, 2026
Version: 1.0
IMPORTANT: These Terms govern use of the SturdiHome Network platform. They are intended as operational website terms and do not replace any separate contract, financing agreement, service contract, or legally required disclosure.
1. Purpose and Platform Role
These Terms govern a finance partner’s access to and use of the SturdiHome platform. SturdiHome is a referral and coordination platform and is not the lender, creditor, underwriter, servicer, or decision-maker for a finance partner’s credit products unless a separate written agreement expressly states otherwise.
2. Separate Partner Agreement
A finance partner may require SturdiHome to sign the finance partner’s own referral, dealer, marketing, technology, or program agreement. That separate agreement governs the matters it covers. These website Terms govern use of SturdiHome’s platform and do not replace product-specific lending documents or a separately executed partner agreement.
3. Referrals
SturdiHome may refer or route eligible users who choose to explore financing. A referral is not a representation that an applicant qualifies for credit. The finance partner remains responsible for its own eligibility criteria, underwriting, disclosures, approvals, denials, pricing, funding, servicing, and regulatory obligations.
4. Referral Compensation
Any referral, marketing, technology, platform, or other compensation between SturdiHome and a finance partner must be separately disclosed or agreed to in writing and must comply with applicable law. These Terms do not create a payment obligation unless the amount and basis of compensation have been separately established.
5. Data Handling
Each party must protect personal and confidential information it receives and use it only for authorized purposes. Access must be limited to personnel and systems with a legitimate need. Each party is responsible for the security, retention, deletion, and legally required handling of data within its control.
6. Applicant Privacy
Finance partners may not disclose an applicant’s nonpublic financial information to SturdiHome except as authorized by the applicant, permitted by law, and reasonably necessary for the agreed platform function. SturdiHome should receive only the status or information necessary for the applicable workflow unless a separate lawful data-sharing arrangement provides otherwise.
7. Compliance
Each finance partner is responsible for maintaining licenses, registrations, policies, disclosures, notices, consents, and compliance procedures required for its products and activities. Each party remains responsible for its own compliance obligations. Neither party may instruct the other to engage in unlawful, deceptive, discriminatory, or unauthorized conduct.
8. No Unauthorized Representations
A finance partner may not represent that SturdiHome guarantees its products, approvals, rates, or funding. SturdiHome may not represent that it controls the finance partner’s underwriting or credit decisions.
9. Platform Security
Finance partners must follow SturdiHome access controls and security requirements and may not bypass permissions, scrape platform data, share credentials, introduce malicious code, or access information outside the scope authorized for their account.
10. Suspension and Termination
SturdiHome may suspend or terminate platform access for security concerns, misuse of data, material noncompliance, unlawful conduct, breach of these Terms, termination of the applicable business relationship, or other material risk. The finance partner may discontinue platform participation subject to obligations that survive termination.
11. Records and Updates
SturdiHome may maintain electronic records of acceptance and platform activity. Updated Terms may be presented for acceptance when platform, legal, security, or business requirements change.
12. Contact
Questions about finance-partner platform terms may be directed to Felicia@SturdiHomeNetwork.com.
Electronic Acceptance
By selecting “I Agree,” creating or continuing to use a finance partner account, or using the SturdiHome platform after these Terms are presented, you acknowledge that you have read and agree to these Terms. SturdiHome may keep an electronic record of the version accepted, date and time of acceptance, account identifier, and related audit information.
PRINTABLE ACKNOWLEDGMENT
Printed Name
                                   
Signature
                                   
Date
                                   
Account / Company
                                   ` },
};