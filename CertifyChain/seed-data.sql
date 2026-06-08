-- ============================================================
-- SEED DATA SCRIPT FOR CERTIFYCHAIN
-- Run against your CertifyChain database
-- Replace @TenantId with your institution's actual TenantId
-- Replace @InstitutionId with your institution's ID
-- ============================================================

-- Set your institution's TenantId here (query: SELECT TenantId FROM Institutions WHERE Id = 1)
DECLARE @TenantId NVARCHAR(450) = (SELECT TenantId FROM Institutions WHERE Id = 1);
DECLARE @InstitutionId INT = 1;
DECLARE @CreatorId INT = 1; -- Admin user ID

-- ============================================================
-- 1. FACULTIES
-- ============================================================
INSERT INTO Faculties (TenantId, Name, Code, InstitutionId, CreationDate, CreatorId, IsDeleted)
VALUES
    (@TenantId, 'Faculty of Engineering', 'ENG', @InstitutionId, GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'Faculty of Science', 'SCI', @InstitutionId, GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'Faculty of Commerce', 'COM', @InstitutionId, GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'Faculty of Arts', 'ART', @InstitutionId, GETUTCDATE(), @CreatorId, 0);

-- Get Faculty IDs
DECLARE @FacultyEng INT = (SELECT Id FROM Faculties WHERE Code = 'ENG' AND TenantId = @TenantId);
DECLARE @FacultySci INT = (SELECT Id FROM Faculties WHERE Code = 'SCI' AND TenantId = @TenantId);
DECLARE @FacultyCom INT = (SELECT Id FROM Faculties WHERE Code = 'COM' AND TenantId = @TenantId);
DECLARE @FacultyArt INT = (SELECT Id FROM Faculties WHERE Code = 'ART' AND TenantId = @TenantId);

-- ============================================================
-- 2. PROGRAMS
-- QualificationType: 0=Certificate, 1=Diploma, 2=Degree, 3=Masters, 4=Doctorate
-- AwardClass: 0=Pass, 1=LowerSecond, 2=UpperSecond, 3=FirstClass, 4=Distinction
-- ============================================================
INSERT INTO Programs (TenantId, Name, Code, Description, QualificationType, AwardClass, FacultyId, CreationDate, CreatorId, IsDeleted)
VALUES
    -- Engineering Programs
    (@TenantId, 'Bachelor of Engineering Honours Degree in Electronic Engineering', 'ENG-ELEC', 'Electronic Engineering Honours', 2, NULL, @FacultyEng, GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'Bachelor of Engineering Honours Degree in Civil Engineering', 'ENG-CIVIL', 'Civil Engineering Honours', 2, NULL, @FacultyEng, GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'Bachelor of Engineering Honours Degree in Mechanical Engineering', 'ENG-MECH', 'Mechanical Engineering Honours', 2, NULL, @FacultyEng, GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'Bachelor of Engineering Honours Degree in Industrial Engineering', 'ENG-IND', 'Industrial Engineering Honours', 2, NULL, @FacultyEng, GETUTCDATE(), @CreatorId, 0),

    -- Science Programs
    (@TenantId, 'Bachelor of Science Honours Degree in Applied Mathematics', 'SCI-MATH', 'Applied Mathematics Honours', 2, NULL, @FacultySci, GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'Bachelor of Science Honours Degree in Applied Physics', 'SCI-PHYS', 'Applied Physics Honours', 2, NULL, @FacultySci, GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'Bachelor of Science Honours Degree in Chemistry', 'SCI-CHEM', 'Chemistry Honours', 2, NULL, @FacultySci, GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'Bachelor of Science Honours Degree in Applied Chemistry', 'SCI-ACHEM', 'Applied Chemistry Honours', 2, NULL, @FacultySci, GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'Bachelor of Science Honours Degree in Applied Biology', 'SCI-BIO', 'Applied Biology Honours', 2, NULL, @FacultySci, GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'Bachelor of Science Honours Degree in Environmental Science', 'SCI-ENV', 'Environmental Science Honours', 2, NULL, @FacultySci, GETUTCDATE(), @CreatorId, 0),

    -- Commerce Programs
    (@TenantId, 'Bachelor of Commerce Honours Degree in Accounting', 'COM-ACC', 'Accounting Honours', 2, NULL, @FacultyCom, GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'Bachelor of Commerce Honours Degree in Banking and Finance', 'COM-FIN', 'Banking and Finance Honours', 2, NULL, @FacultyCom, GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'Bachelor of Commerce Honours Degree in Marketing', 'COM-MKT', 'Marketing Honours', 2, NULL, @FacultyCom, GETUTCDATE(), @CreatorId, 0),

    -- Arts Programs
    (@TenantId, 'Bachelor of Arts Honours Degree in Media Studies', 'ART-MED', 'Media Studies Honours', 2, NULL, @FacultyArt, GETUTCDATE(), @CreatorId, 0);

-- ============================================================
-- 3. STUDENTS
-- ============================================================
INSERT INTO Students (TenantId, StudentNumber, FirstName, LastName, Email, DateOfBirth, CreationDate, CreatorId, IsDeleted)
VALUES
    (@TenantId, 'STU-2020-001', 'Tatenda', 'Moyo', 'tatenda.moyo@students.ac.zw', '2000-03-15', GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'STU-2020-002', 'Chiedza', 'Mapfumo', 'chiedza.mapfumo@students.ac.zw', '1999-07-22', GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'STU-2020-003', 'Tendai', 'Ncube', 'tendai.ncube@students.ac.zw', '2000-01-10', GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'STU-2020-004', 'Rumbidzai', 'Dube', 'rumbidzai.dube@students.ac.zw', '1999-11-05', GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'STU-2020-005', 'Takudzwa', 'Sibanda', 'takudzwa.sibanda@students.ac.zw', '2000-05-28', GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'STU-2020-006', 'Nyasha', 'Chirwa', 'nyasha.chirwa@students.ac.zw', '1999-09-14', GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'STU-2020-007', 'Farai', 'Mutasa', 'farai.mutasa@students.ac.zw', '2000-02-18', GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'STU-2020-008', 'Ruvimbo', 'Banda', 'ruvimbo.banda@students.ac.zw', '1998-12-03', GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'STU-2020-009', 'Simbarashe', 'Moyo', 'simbarashe.moyo@students.ac.zw', '2001-04-20', GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'STU-2020-010', 'Tsitsi', 'Madziva', 'tsitsi.madziva@students.ac.zw', '1999-06-30', GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'STU-2020-011', 'Kudakwashe', 'Nyoni', 'kudakwashe.nyoni@students.ac.zw', '2000-08-12', GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'STU-2020-012', 'Blessing', 'Chikwanha', 'blessing.chikwanha@students.ac.zw', '1999-01-25', GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'STU-2020-013', 'Simbarashe', 'Tafirenyika', 'simbarashe.tafirenyika@students.ac.zw', '2000-10-08', GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'STU-2020-014', 'Ruvimbo', 'Makoni', 'ruvimbo.makoni@students.ac.zw', '1999-04-17', GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'STU-2020-015', 'Kudzai', 'Mhembere', 'kudzai.mhembere@students.ac.zw', '2000-12-01', GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'STU-2020-016', 'Simbarashe', 'Mutasa', 'simbarashe.mutasa@students.ac.zw', '1999-08-22', GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'STU-2020-017', 'Ruvimbo', 'Chikwanha', 'ruvimbo.chikwanha@students.ac.zw', '2000-06-14', GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'STU-2020-018', 'Farai', 'Chimurenga', 'farai.chimurenga@students.ac.zw', '2001-02-09', GETUTCDATE(), @CreatorId, 0),
    (@TenantId, 'STU-2020-019', 'Tafadzwa', 'Nkomo', 'tafadzwa.nkomo@students.ac.zw', '1998-11-27', GETUTCDATE(), @CreatorId, 0);

-- ============================================================
-- 4. STUDENT-PROGRAM ENROLMENTS
-- ============================================================
INSERT INTO StudentPrograms (StudentId, ProgramId, EnrolledAt)
VALUES
    -- Tatenda Moyo -> Electronic Engineering
    ((SELECT Id FROM Students WHERE StudentNumber = 'STU-2020-001' AND TenantId = @TenantId),
     (SELECT Id FROM Programs WHERE Code = 'ENG-ELEC' AND TenantId = @TenantId), '2020-02-01'),

    -- Chiedza Mapfumo -> Accounting
    ((SELECT Id FROM Students WHERE StudentNumber = 'STU-2020-002' AND TenantId = @TenantId),
     (SELECT Id FROM Programs WHERE Code = 'COM-ACC' AND TenantId = @TenantId), '2020-02-01'),

    -- Tendai Ncube -> Applied Mathematics
    ((SELECT Id FROM Students WHERE StudentNumber = 'STU-2020-003' AND TenantId = @TenantId),
     (SELECT Id FROM Programs WHERE Code = 'SCI-MATH' AND TenantId = @TenantId), '2020-02-01'),

    -- Rumbidzai Dube -> Civil Engineering
    ((SELECT Id FROM Students WHERE StudentNumber = 'STU-2020-004' AND TenantId = @TenantId),
     (SELECT Id FROM Programs WHERE Code = 'ENG-CIVIL' AND TenantId = @TenantId), '2020-02-01'),

    -- Takudzwa Sibanda -> Applied Physics
    ((SELECT Id FROM Students WHERE StudentNumber = 'STU-2020-005' AND TenantId = @TenantId),
     (SELECT Id FROM Programs WHERE Code = 'SCI-PHYS' AND TenantId = @TenantId), '2020-02-01'),

    -- Nyasha Chirwa -> Banking and Finance
    ((SELECT Id FROM Students WHERE StudentNumber = 'STU-2020-006' AND TenantId = @TenantId),
     (SELECT Id FROM Programs WHERE Code = 'COM-FIN' AND TenantId = @TenantId), '2020-02-01'),

    -- Farai Mutasa -> Chemistry (Page 9) / Marketing (Page 14) - using Marketing
    ((SELECT Id FROM Students WHERE StudentNumber = 'STU-2020-007' AND TenantId = @TenantId),
     (SELECT Id FROM Programs WHERE Code = 'COM-MKT' AND TenantId = @TenantId), '2020-02-01'),

    -- Ruvimbo Banda -> Marketing
    ((SELECT Id FROM Students WHERE StudentNumber = 'STU-2020-008' AND TenantId = @TenantId),
     (SELECT Id FROM Programs WHERE Code = 'COM-MKT' AND TenantId = @TenantId), '2018-02-01'),

    -- Simbarashe Moyo -> Mechanical Engineering
    ((SELECT Id FROM Students WHERE StudentNumber = 'STU-2020-009' AND TenantId = @TenantId),
     (SELECT Id FROM Programs WHERE Code = 'ENG-MECH' AND TenantId = @TenantId), '2019-02-01'),

    -- Tsitsi Madziva -> Applied Biology
    ((SELECT Id FROM Students WHERE StudentNumber = 'STU-2020-010' AND TenantId = @TenantId),
     (SELECT Id FROM Programs WHERE Code = 'SCI-BIO' AND TenantId = @TenantId), '2018-02-01'),

    -- Kudakwashe Nyoni -> Media Studies
    ((SELECT Id FROM Students WHERE StudentNumber = 'STU-2020-011' AND TenantId = @TenantId),
     (SELECT Id FROM Programs WHERE Code = 'ART-MED' AND TenantId = @TenantId), '2019-02-01'),

    -- Blessing Chikwanha -> Applied Chemistry
    ((SELECT Id FROM Students WHERE StudentNumber = 'STU-2020-012' AND TenantId = @TenantId),
     (SELECT Id FROM Programs WHERE Code = 'SCI-ACHEM' AND TenantId = @TenantId), '2020-02-01'),

    -- Simbarashe Tafirenyika -> Industrial Engineering
    ((SELECT Id FROM Students WHERE StudentNumber = 'STU-2020-013' AND TenantId = @TenantId),
     (SELECT Id FROM Programs WHERE Code = 'ENG-IND' AND TenantId = @TenantId), '2020-02-01'),

    -- Ruvimbo Makoni -> Environmental Science
    ((SELECT Id FROM Students WHERE StudentNumber = 'STU-2020-014' AND TenantId = @TenantId),
     (SELECT Id FROM Programs WHERE Code = 'SCI-ENV' AND TenantId = @TenantId), '2020-02-01'),

    -- Kudzai Mhembere -> Accounting
    ((SELECT Id FROM Students WHERE StudentNumber = 'STU-2020-015' AND TenantId = @TenantId),
     (SELECT Id FROM Programs WHERE Code = 'COM-ACC' AND TenantId = @TenantId), '2020-02-01'),

    -- Simbarashe Mutasa -> Environmental Science
    ((SELECT Id FROM Students WHERE StudentNumber = 'STU-2020-016' AND TenantId = @TenantId),
     (SELECT Id FROM Programs WHERE Code = 'SCI-ENV' AND TenantId = @TenantId), '2019-02-01'),

    -- Ruvimbo Chikwanha -> Marketing
    ((SELECT Id FROM Students WHERE StudentNumber = 'STU-2020-017' AND TenantId = @TenantId),
     (SELECT Id FROM Programs WHERE Code = 'COM-MKT' AND TenantId = @TenantId), '2018-02-01'),

    -- Farai Chimurenga -> Industrial Engineering
    ((SELECT Id FROM Students WHERE StudentNumber = 'STU-2020-018' AND TenantId = @TenantId),
     (SELECT Id FROM Programs WHERE Code = 'ENG-IND' AND TenantId = @TenantId), '2020-02-01'),

    -- Tafadzwa Nkomo -> Applied Chemistry
    ((SELECT Id FROM Students WHERE StudentNumber = 'STU-2020-019' AND TenantId = @TenantId),
     (SELECT Id FROM Programs WHERE Code = 'SCI-ACHEM' AND TenantId = @TenantId), '2018-02-01');

-- ============================================================
-- 5. FIX EXISTING AI DETECTION LOGS (set correct TenantId)
-- ============================================================
UPDATE AiDetectionLogs 
SET TenantId = @TenantId
WHERE InstitutionId = @InstitutionId 
  AND TenantId = '00000000-0000-0000-0000-000000000001';

-- ============================================================
-- VERIFY
-- ============================================================
SELECT 'Faculties' AS [Table], COUNT(*) AS [Count] FROM Faculties WHERE TenantId = @TenantId
UNION ALL
SELECT 'Programs', COUNT(*) FROM Programs WHERE TenantId = @TenantId
UNION ALL
SELECT 'Students', COUNT(*) FROM Students WHERE TenantId = @TenantId
UNION ALL
SELECT 'StudentPrograms', COUNT(*) FROM StudentPrograms SP
    INNER JOIN Students S ON SP.StudentId = S.Id WHERE S.TenantId = @TenantId;
