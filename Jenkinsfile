#!groovy
import groovy.transform.Field

node('Builder') {
    currentBuild.result = "SUCCESS"
    def isMasterBranch = BRANCH_NAME.toUpperCase() == "MASTER"
    def cfSpaceWithBranch = ""
    def cfAppNameWithBranch =  ""
    def cfAppRouteWithBranch =  ""
    def isIntegrationBranch = false

    withEnv([
        'devopsName=AA Jenkins DevOps',
        'emailFrom=no-reply@jenkins.devops.aa.com',
        'slackChannel= #ssm-fly-mig-builds',
        'slackHook=https://americanairlines.slack.com/services/hooks/jenkins-ci/',
        "cfAppName=${cfAppNameWithBranch}",
        'httpProxy=http://inetgw.aa.com:9093'
    ]) {
        withCredentials([
            string(credentialsId: 'SSM_FLY_SLACK_TOKEN', variable: 'SLACK_TOKEN'),
            string(credentialsId: 'SSM_FLY_PRIORITY_BUILD_APPROVERS', variable: 'BUILD_APPROVERS')]) {
            try {
                stage('Checkout') {
                    // ensure a clean directory
                    deleteDir()
                    // print the git version
                    sh 'git --version'
                    // clone git
                    checkout scm
                    // set git user info
                    sh "git config user.name \"${devopsName}\" && git config user.email \"${emailFrom}\""
                    // force clean and reset
                    sh 'git clean -fd && git reset'
                }
                stage('Build') {
                    slackSend channel: "${slackChannel}", message: "Build Started: ${env.JOB_NAME} ${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)", color: '#FFFF00', token: "${SLACK_TOKEN}", baseUrl: "${slackHook}"
                    def nodejs = "node"
                    def npm = "npm"
                    // print the node and npm version
                    sh "${nodejs} --version && ${npm} --version"
                    // install dependencies
                    sh "${npm} install"
                    // run tslint
                    sh "${npm} run lint"
                    // run test for code coverage
                    sh "${npm} run test:ci"
                    //unit test
                    sh "${npm} run testReport"
                    // build
                    sh "${npm} run build:ci"
                }
                stage('Test Results') {
                    // publish test results
                    junit 'junit/**/*.xml'
                    // publish code coverage
                    cobertura 'coverage/cobertura-coverage.xml'
                }


                /*** SONAR Issue RePORTED***/

               stage('Sonar'){
                    withCredentials([string(credentialsId: 'SONAR_DEPLOY_KEY', variable: 'SONAR_TOKEN')]){
                        if (BRANCH_NAME =~ /_/){
                            print 'ignoring sonar for developer branches'
                        }else{
                             sh "sonar-scanner -Dsonar.login=${SONAR_TOKEN} -Dsonar.projectKey=${BRANCH_NAME} -Dsonar.projectName=${BRANCH_NAME} "
                        }
                    }

                }

                
                stage('Deploy Prep') {
                    // pring Cloud Foundry CLI version
                    sh 'cf -v'
                    // make CF deploy script executable
                    sh 'chmod u+x ./devops/ibm-cloud/deploy.sh'
                }
                withEnv(['cfApiUrl=https://api.ng.bluemix.net', 'cfOrg=AA-CustTech-FLY', 'cfAppDomain=mybluemix.net']) {
                    if (isMasterBranch){
                        stage('Wait for Input') {
                            try {
                                timeout(time: 60, unit: 'SECONDS') { // change to a convenient timeout for you
                                    userInput = input message: 'Choose Deployment Environments',
                                    parameters: [booleanParam(defaultValue: false, description: 'Deploy To QA', name: 'QA'),
                                    booleanParam(defaultValue: false, description: 'Deploy To StageSouth', name: 'StageSouth'),
                                    booleanParam(defaultValue: false, description: 'Deploy To StageNorth', name: 'StageNorth'),
                                    booleanParam(defaultValue: false, description: 'Deploy To ProdSouth', name: 'ProdSouth'),
                                    booleanParam(defaultValue: false, description: 'Deploy To ProdNorth', name: 'ProdNorth')]
                                    submitter: "${BUILD_APPROVERS}"
                                    println(userInput); //Use this value to branch to different logic if needed
                                }
                            } catch (err) { // timeout reached or input false
                                echo("Input timeout expired, default will be used: " + userInput)
                            }
                        }

                        if(userInput.QA) {
                            stage('Deploy QA') {
                                echo "************* Deploying QA build to Public cloud ******"
                                cfApiUrl = "https://api.ng.bluemix.net"
                                cfSpace = "fly-ssm-web-iqa"
                                cfAppNameQA = "aa-ct-fly-ssm-web-qa"
                                manifestPath= "./devops/ibm-cloud/manifest-qa.yml"
                                cfKeepRollback= "0"
                                deployToPublic(cfApiUrl, cfSpace, cfAppNameQA, manifestPath, cfKeepRollback)
                            }
                        }
                        if(userInput.StageNorth) {
                            stage('Deploy: Stage aa1') {
                                echo "************* Deploying Stage build to Dedicated cloud ******"
                                cfOrgStage = "AA-CustTech-Fly-HL"
                                cfSpaceStage = "fly-ssm-web-stage"
                                cfAppNameStage = "aa-ct-fly-ssm-web-stage"
                                manifestPathStage = "./devops/ibm-cloud/manifest-stage.yml"
                                cfKeepRollbackStage = "0"
                                deployToDedicated(cfOrgStage, cfSpaceStage, cfAppNameStage, manifestPathStage, cfKeepRollbackStage, "aa1", "Stage")
                            }
                        }
                        if(userInput.StageSouth) {
                            stage('Deploy: Stage aa2') {
                                echo "************* Deploying Stage build to Dedicated cloud ******"
                                cfOrgStage = "AA-CustTech-Fly-HL"
                                cfSpaceStage = "fly-ssm-web-stage"
                                cfAppNameStage = "aa-ct-fly-ssm-web-stage"
                                manifestPathStage = "./devops/ibm-cloud/manifest-stage.yml"
                                cfKeepRollbackStage = "0"
                                deployToDedicated(cfOrgStage, cfSpaceStage, cfAppNameStage, manifestPathStage, cfKeepRollbackStage, "aa2", "Stage")
                            }
                        }
                        if(userInput.ProdNorth) {
                            stage('Deploy: Prod aa1') {
                                echo "************* Deploying Prod build to Dedicated cloud ******"
                                cfOrgProd = "AA-CustTech-Fly-HL"
                                cfSpaceProd = "fly-ssm-web-prod"
                                cfAppNameProd = "aa-ct-fly-ssm-web"
                                manifestPathProd = "./devops/ibm-cloud/manifest-prod.yml"
                                cfKeepRollbackProd = "1"
                                deployToDedicated(cfOrgProd, cfSpaceProd, cfAppNameProd, manifestPathProd, cfKeepRollbackProd, "aa1", "Prod")
                            }
                        }
                        if(userInput.ProdSouth) {
                            stage('Deploy: Prod aa2') {
                                echo "************* Deploying Prod build to Dedicated cloud ******"
                                cfOrgProd = "AA-CustTech-Fly-HL"
                                cfSpaceProd = "fly-ssm-web-prod"
                                cfAppNameProd = "aa-ct-fly-ssm-web"
                                manifestPathProd = "./devops/ibm-cloud/manifest-prod.yml"
                                cfKeepRollbackProd = "1"
                                deployToDedicated(cfOrgProd, cfSpaceProd, cfAppNameProd, manifestPathProd, cfKeepRollbackProd, "aa2", "Prod")
                            }
                        }
                    //
                    } else if (BRANCH_NAME =~ /-qa/){
                        stage('deploy QA' + BRANCH_NAME ) {
                            cfSpace = BRANCH_NAME
                            echo "************* Deploying QA build to Public cloud ******"
                            cfApiUrl = "https://api.ng.bluemix.net"
                            cfAppNameQA = BRANCH_NAME
                            manifestPath = "./devops/ibm-cloud/manifest-qa.yml"
                            cfKeepRollback = "0"
                            deployToPublic(cfApiUrl, cfSpace, cfAppNameQA, manifestPath, cfKeepRollback)
                        }
                    //
                    } else if (BRANCH_NAME =~ /-dev/){
                        stage('deploy dev' + BRANCH_NAME ){
                            cfAppNameWithBranch = BRANCH_NAME.replaceAll('_','-')
                             cfSpace = BRANCH_NAME.substring(0, BRANCH_NAME.indexOf('dev')) + "dev"
                               cfAppNameQA = "${cfAppNameWithBranch}"
                            manifestPath = "./devops/ibm-cloud/manifest-dev.yml"
                            cfKeepRollback = "0"
                            println cfKeepRollback
                            deployToPublic(cfApiUrl, cfSpace, cfAppNameQA, manifestPath, cfKeepRollback)
                        }
                    //
                    } else if (BRANCH_NAME =~ /-iqa/){
                        stage('deploy IQA' + BRANCH_NAME ){
                            cfSpace = BRANCH_NAME
                            cfAppNameQA = BRANCH_NAME
                            manifestPath = "./devops/ibm-cloud/manifest-qa.yml"
                            cfKeepRollback = "0"
                            println cfKeepRollback
                            deployToPublic(cfApiUrl, cfSpace, cfAppNameQA, manifestPath, cfKeepRollback)
                        }
                    }
                }
            } catch(err) {
                currentBuild.result = "FAILURE"
                def errorMessage = err.getMessage()
                def subject = "${currentBuild.result}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'"
                def summary = "${subject} (<${env.BUILD_URL}|Open>)\n\n${errorMessage}"
                slackSend channel: "${slackChannel}", message: summary, color: '#FF0000', token: "${SLACK_TOKEN}", baseUrl: "${slackHook}"
                throw err
            } finally {
                // always clean up directory
                deleteDir()
            }
        }
    }
}

//deploys the app to dedicated environments - stage or prod
def deployToDedicated(cfOrg, dedicatedCfSpace, dedicatedCfAppName, manifestPath, cfKeepRollback, datacenter, jenStage) {
    echo "******* Deploying $dedicatedCfAppName to Dedicated Cloud Space - $dedicatedCfSpace in $datacenter"
    bluemixMode = "dedicated"
    httpProxy = "http://inetgw.aa.com:9093"
    //jarPath = "./devops/ibm-cloud/defaultServer/apps/ancillary-host.war"
    newRelicLicenseKey="welcome"

    if (datacenter == "aa1") {
        // api endpoint details for dedicated
        dedicatedCfApiUrl = "https://api.aa.us-ne.bluemix.net"
        dedicatedCfAppDomain = "aa.us-ne.mybluemix.net"
    } else {
        // api endpoint details for dedicated
        dedicatedCfApiUrl = "https://api.aa.us-south.bluemix.net"
        dedicatedCfAppDomain = "aa.us-south.mybluemix.net"
    }

    if(jenStage == "Stage") {
        echo "******* It's stage deplyment. Proceeding with Stage Relic key *****"
        withCredentials([usernamePassword(credentialsId: 'SSM_FLY_SERVICES_DEPLOY_Prod_MAHE', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
            //get passcode util from Nexus
            def jarFile = "aa-cf-sso-1.1.jar"
            sh "wget -q http://nxrepo.qcorpaa.aa.com:8081/nexus/content/repositories/AA-CustTech-Fly-releases/com/aa/cf/aa-cf-sso/1.1/$jarFile"
            sh """
            pcode=\$(java -jar ${jarFile} -u ${USERNAME} -p ${PASSWORD} -a ${datacenter} -useproxy)
            ./devops/ibm-cloud/deploy.sh ${dedicatedCfApiUrl} \${pcode} ${cfOrg} ${dedicatedCfSpace} ${dedicatedCfAppDomain} ${dedicatedCfAppName} ${manifestPath}  ${cfKeepRollback} ${bluemixMode} ${httpProxy}
            """
        }
    } else {
        echo "******* It's Prod deplyment. Proceeding with Prod Relic key *****"
            withCredentials([usernamePassword(credentialsId: 'SSM_FLY_SERVICES_DEPLOY_Prod_MAHE', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {

            //get passcode util from Nexus
            def jarFile = "aa-cf-sso-1.1.jar"
            sh "wget -q http://nxrepo.qcorpaa.aa.com:8081/nexus/content/repositories/AA-CustTech-Fly-releases/com/aa/cf/aa-cf-sso/1.1/$jarFile"

            sh """
            pcode=\$(java -jar ${jarFile} -u ${USERNAME} -p ${PASSWORD} -a ${datacenter} -useproxy)
            ./devops/ibm-cloud/deploy.sh ${dedicatedCfApiUrl} \${pcode} ${cfOrg} ${dedicatedCfSpace} ${dedicatedCfAppDomain} ${dedicatedCfAppName} ${manifestPath} ${cfKeepRollback} ${bluemixMode} ${httpProxy}
            """
        }
    }
    def subject = "Deployment Success: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'"
    def summary = "${subject} (<${env.BUILD_URL}|Open>)\n\n(<https://${dedicatedCfAppName}.${dedicatedCfAppDomain}/|View Website>)"
    slackSend channel: "${slackChannel}", message: summary, color: '#00FF00', token: "${SLACK_TOKEN}", baseUrl: "${slackHook}"
}

def deployToPublic(cfApiUrlPub, cfSpacePub, cfAppName, manifestPath, cfKeepRollback) {
    bluemixMode = "public"
    echo "******* Deploying $cfAppName to Public  Cloud - $cfSpacePub"
    // get Bluemix API credentials from Jenkins "Credentials" store
    withCredentials([string(credentialsId: 'SSM_FLY_ANCILLARY_BLUEMIX_API_KEY', variable: 'CF_API_KEY')]) {
        sh "./devops/ibm-cloud/deploy.sh \"${cfApiUrlPub}\" \"${CF_API_KEY}\" \"${cfOrg}\" \"${cfSpacePub}\" \"${cfAppDomain}\" \"${cfAppName}\" \"${manifestPath}\" \"${cfKeepRollback}\" \"${bluemixMode}\" \"${httpProxy}\""
    }
    def subject = "Deployment Success: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'"
    def summary = "${subject} (<${env.BUILD_URL}|Open>)\n\n(<https://${cfAppName}.${cfAppDomain}/|View Website>)"
    slackSend channel: "${slackChannel}", message: summary, color: '#00FF00', token: "${SLACK_TOKEN}", baseUrl: "${slackHook}"
}

private cobertura(path) {
    // publish code coverage
    step([$class: 'CoberturaPublisher',
        autoUpdateHealth: false,
        autoUpdateStability: false,
        coberturaReportFile: path,
        failUnhealthy: false,
        failUnstable: false,
        maxNumberOfBuilds: 0,
        onlyStable: false,
        sourceEncoding: 'ASCII',
        zoomCoverageChart: false])
}
