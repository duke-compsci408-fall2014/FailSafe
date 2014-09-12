//
//  ViewController.h
//  Tip Calculator
//
//  Created by David Chou on 9/7/14.
//  Copyright (c) 2014 David Chou. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface ViewController : UIViewController <UITextFieldDelegate>
@property (weak, nonatomic) IBOutlet UITextField *txtUsername;
@property (weak, nonatomic) IBOutlet UITextField *txtPassword;
- (IBAction)signinClicked:(id)sender;
- (IBAction)backgroundTap:(id)sender;

@end
