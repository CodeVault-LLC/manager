/**
 * SystemService class for managing system-level operations.
 * This service is responsible for handling system-related functionalities
 * such as logging, configuration management, and other system utilities.
 */
export class SystemService {
  private static instance: SystemService;

  constructor() {
    if (SystemService.instance) {
      throw new Error(
        "SystemService is a singleton and cannot be instantiated multiple times."
      );
    }

    SystemService.instance = this;
  }

  static getInstance(): SystemService {
    if (!SystemService.instance) {
      SystemService.instance = new SystemService();
    }
   
    return SystemService.instance;
  }

  
}
