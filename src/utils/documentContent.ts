
export const generateDocumentContent = (fileName: string, fileType: string): string => {
  const baseName = fileName.toLowerCase();
  
  if (baseName.includes('medical') || baseName.includes('report') || baseName.includes('journal')) {
    return `PATIENT MEDICAL RECORD

Patient: Erik Stålman
Date of Birth: 1985-03-12
Patient ID: PS-2024-001
Date: ${new Date().toLocaleDateString()}

CHIEF COMPLAINT:
Lower back pain following motor vehicle accident on ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}

HISTORY OF PRESENT ILLNESS:
Mr. Stålman reports acute onset of severe lower back pain immediately following a motor vehicle collision. Patient describes the pain as sharp, stabbing, and radiating down the left leg to the knee. Pain intensity: 8/10. Patient denies numbness or tingling in the extremities but reports muscle spasms and difficulty with ambulation.

PAST MEDICAL HISTORY:
- No prior back injuries
- Allergies: NKDA
- Current medications: None
- Previous surgeries: Appendectomy (2010)

PHYSICAL EXAMINATION:
Vital Signs: BP 130/80, HR 78, RR 16, Temp 98.6°F

Musculoskeletal:
- Tenderness over L4-L5 vertebral region
- Limited range of motion in lumbar spine
- Positive straight leg raise test on left side
- Muscle spasms palpable in paraspinal region
- Gait: Antalgic, favoring right side

Neurological:
- Deep tendon reflexes: 2+ and symmetric
- Sensation intact to light touch
- Motor strength: 5/5 in upper extremities, 4+/5 in left lower extremity

ASSESSMENT:
1. Acute lumbar strain secondary to motor vehicle accident
2. Possible L4-L5 disc herniation
3. Lumbar radiculopathy, left side

PLAN:
1. MRI lumbar spine to rule out disc herniation
2. Physical therapy referral
3. Pain management consultation
4. Follow-up in 2 weeks
5. Work restrictions: No heavy lifting >10 lbs

Dr. Sarah Johnson, MD
Orthopedic Specialist
License: MD-2024-5678`;
  }
  
  if (baseName.includes('xray') || baseName.includes('imaging') || baseName.includes('scan') || baseName.includes('mri')) {
    return `RADIOLOGY REPORT

Patient: Erik Stålman
DOB: 1985-03-12
Exam Date: ${new Date().toLocaleDateString()}
Study: Lumbar Spine MRI

CLINICAL HISTORY:
Lower back pain following motor vehicle accident. Rule out disc herniation.

TECHNIQUE:
MRI of the lumbar spine was performed using T1 and T2-weighted sequences in sagittal and axial planes.

FINDINGS:
Vertebral Bodies: Normal vertebral body height and alignment. No compression fractures identified.

Intervertebral Discs:
- L1-L2 through L3-L4: Normal disc height and signal intensity
- L4-L5: Mild disc bulge with central protrusion measuring 3mm. No significant canal stenosis
- L5-S1: Normal

Spinal Canal: Patent throughout. No significant stenosis.

Neural Foramina: Bilateral neural foramina are patent at all levels.

Soft Tissues: Mild paraspinal muscle edema at L4-L5 level consistent with muscle strain.

IMPRESSION:
1. L4-L5 disc bulge with mild central protrusion
2. Paraspinal muscle strain at L4-L5 level
3. No evidence of nerve root compression
4. No acute fractures or instability

RECOMMENDATIONS:
Conservative management with physical therapy. Consider epidural steroid injection if symptoms persist.

Dr. Michael Chen, MD
Radiologist
License: RAD-2024-9876`;
  }
  
  if (baseName.includes('police') || baseName.includes('accident') || baseName.includes('crash')) {
    return `TRAFFIC COLLISION REPORT

Report Number: TC-${Date.now()}
Date of Accident: ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
Time: 14:30 hours
Location: Main Street & Oak Avenue intersection
Weather: Clear, dry conditions

PARTIES INVOLVED:

Vehicle 1:
Driver: Erik Stålman
DOB: 03/12/1985
License: DL-${Math.floor(Math.random() * 1000000)}
Vehicle: 2020 Honda Civic, License Plate: ABC-123
Insurance: SafeGuard Insurance, Policy #SG-2024-001

Vehicle 2:
Driver: Jane Doe
DOB: 07/22/1978
License: DL-${Math.floor(Math.random() * 1000000)}
Vehicle: 2018 Ford F-150, License Plate: XYZ-789
Insurance: Reliable Auto, Policy #RA-2024-002

NARRATIVE:
Vehicle 2 (Ford F-150) was traveling eastbound on Main Street at approximately 45 mph. Vehicle 1 (Honda Civic) was traveling northbound on Oak Avenue and had come to a complete stop at the red traffic signal.

At approximately 14:30 hours, the traffic signal changed to green for northbound traffic. Vehicle 1 proceeded through the intersection when Vehicle 2 ran the red light and struck Vehicle 1 on the driver's side door.

Point of impact occurred in the center of the intersection. Vehicle 1 sustained major damage to the driver's side and was pushed approximately 25 feet northeast from the point of impact.

INJURIES:
Vehicle 1 driver (Stålman) complained of severe back pain and was transported to City General Hospital by EMS Unit 15.
Vehicle 2 driver (Doe) sustained minor cuts from broken glass, treated at scene.

DAMAGE ASSESSMENT:
Vehicle 1: Major damage, estimated $18,000
Vehicle 2: Moderate front-end damage, estimated $8,500

CITATIONS ISSUED:
Vehicle 2 driver cited for:
- Running red light (VC 21453a)
- Failure to yield right of way (VC 21801)

INVESTIGATING OFFICER:
Sergeant Robert Johnson
Badge #1234
Traffic Division
Signature: [Signed]

WITNESS STATEMENTS:
Witness 1: Mary Smith (pedestrian) - Confirms Vehicle 2 ran red light
Contact: (555) 123-4567`;
  }

  if (baseName.includes('insurance') || baseName.includes('claim')) {
    return `INSURANCE CLAIM REPORT

Claim Number: CLM-2024-${Math.floor(Math.random() * 100000)}
Policy Number: SG-2024-001
Date of Loss: ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
Date Reported: ${new Date().toLocaleDateString()}

INSURED INFORMATION:
Name: Erik Stålman
Policy Holder: Same
Address: 123 Oak Street, Springfield, ST 12345
Phone: (555) 987-6543
Email: erik.stalman@email.com

LOSS DETAILS:
Type of Loss: Motor Vehicle Accident
Location: Main Street & Oak Avenue intersection
Description: Insured vehicle struck by third party while proceeding through intersection on green light

VEHICLE INFORMATION:
Year/Make/Model: 2020 Honda Civic LX
VIN: 1HGBH41JXMN109186
License Plate: ABC-123
Mileage: 45,230

DAMAGES:
- Driver side door: Crushed, requires replacement
- Driver side quarter panel: Damaged, requires repair
- Driver side window: Shattered
- Side airbag: Deployed
- Frame damage: Minor, repairable

ESTIMATED REPAIR COST: $18,247.50

MEDICAL EXPENSES:
Emergency room visit: $2,450.00
Ambulance transport: $850.00
MRI scan: $1,200.00
Physical therapy (estimated): $2,500.00
Total medical (to date): $7,000.00

LIABILITY ASSESSMENT:
Third party at fault - ran red light
Police report confirms liability
Subrogation action initiated against third party carrier

ADJUSTER: Jennifer Williams
PHONE: (555) 234-5678
EMAIL: j.williams@safeguard.com

STATUS: Under investigation - awaiting additional medical reports`;
  }
  
  return `DOCUMENT SUMMARY

File Name: ${fileName}
File Type: ${fileType}
Upload Date: ${new Date().toLocaleString()}

This document has been uploaded to the claims management system and is available for review. The content analysis will be performed automatically to extract relevant information for case processing.

Document processing status: Complete
Content extraction: Available
Security scan: Passed
Compliance check: Approved

For technical support, contact the IT helpdesk at support@company.com`;
};

export const readFileContent = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // For demo purposes, create realistic document content based on file type
      const content = generateDocumentContent(file.name, file.type);
      resolve(content);
    };
    reader.readAsText(file);
  });
};
