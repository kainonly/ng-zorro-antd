import { BidiModule, Dir } from '@angular/cdk/bidi';
import { CommonModule } from '@angular/common';
import { Component, DebugElement, NgZone, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconTestModule } from 'ng-zorro-antd/icon/testing';

import { NzBreadCrumbItemComponent } from './breadcrumb-item.component';
import { NzBreadCrumbComponent } from './breadcrumb.component';
import { NzBreadCrumbModule } from './breadcrumb.module';
import { NzDemoBreadcrumbBasicComponent } from './demo/basic';
import { NzDemoBreadcrumbDropdownComponent } from './demo/dropdown';
import { NzDemoBreadcrumbSeparatorComponent } from './demo/separator';

describe('breadcrumb', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [BidiModule, NzBreadCrumbModule],
        declarations: [NzDemoBreadcrumbBasicComponent, NzTestBreadcrumbRtlComponent]
      }).compileComponents();
    })
  );

  describe('basic', () => {
    let fixture: ComponentFixture<NzDemoBreadcrumbBasicComponent>;
    let items: DebugElement[];
    let breadcrumb: DebugElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(NzDemoBreadcrumbBasicComponent);
      items = fixture.debugElement.queryAll(By.directive(NzBreadCrumbItemComponent));
      breadcrumb = fixture.debugElement.query(By.directive(NzBreadCrumbComponent));
    });

    it('should have correct style', () => {
      fixture.detectChanges();
      expect(items.every(item => item.nativeElement.firstElementChild!.classList.contains('ant-breadcrumb-link'))).toBe(
        true
      );
      expect(items.every(item => item.nativeElement.children[1].classList.contains('ant-breadcrumb-separator'))).toBe(
        true
      );
      expect(breadcrumb.nativeElement.classList.contains('ant-breadcrumb')).toBe(true);
    });
  });

  describe('dropdown', () => {
    let fixture: ComponentFixture<NzDemoBreadcrumbDropdownComponent>;
    let items: DebugElement[];

    beforeEach(
      waitForAsync(() => {
        TestBed.configureTestingModule({
          imports: [RouterTestingModule, NzBreadCrumbModule, NzDropDownModule],
          declarations: [NzDemoBreadcrumbDropdownComponent],
          providers: []
        }).compileComponents();
      })
    );

    beforeEach(() => {
      fixture = TestBed.createComponent(NzDemoBreadcrumbDropdownComponent);
      items = fixture.debugElement.queryAll(By.directive(NzBreadCrumbItemComponent));
    });

    it('should dropdown work', () => {
      fixture.detectChanges();

      const dropdownElement = items[2];
      expect((dropdownElement.nativeElement as HTMLElement).querySelector('.ant-dropdown-trigger')).not.toBe(null);
    });
  });

  describe('separator', () => {
    let fixture: ComponentFixture<NzDemoBreadcrumbSeparatorComponent>;
    let items: DebugElement[];
    let breadcrumbs: DebugElement[];

    beforeEach(
      waitForAsync(() => {
        TestBed.configureTestingModule({
          imports: [NzBreadCrumbModule, NzIconTestModule],
          declarations: [NzDemoBreadcrumbSeparatorComponent]
        }).compileComponents();
      })
    );

    beforeEach(() => {
      fixture = TestBed.createComponent(NzDemoBreadcrumbSeparatorComponent);
      items = fixture.debugElement.queryAll(By.directive(NzBreadCrumbItemComponent));
      breadcrumbs = fixture.debugElement.queryAll(By.directive(NzBreadCrumbComponent));
    });

    it('should nzSeparator work', () => {
      fixture.detectChanges();
      expect(items.every(item => item.nativeElement.firstElementChild!.classList.contains('ant-breadcrumb-link'))).toBe(
        true
      );
      expect(items.every(item => item.nativeElement.children[1].classList.contains('ant-breadcrumb-separator'))).toBe(
        true
      );
      expect(breadcrumbs.every(breadcrumb => breadcrumb.nativeElement.classList.contains('ant-breadcrumb'))).toBe(true);
      expect(items[0].nativeElement.children[1].innerText.indexOf('>') > -1).toBe(true);
      expect(items[3].nativeElement.children[1].firstElementChild!.classList.contains('anticon-arrow-right')).toBe(
        true
      );
    });
  });

  describe('auto generated', () => {
    let fixture: ComponentFixture<NzBreadcrumbAutoGenerateDemoComponent>;
    let router: Router;
    let breadcrumb: DebugElement;

    it('should auto generating work', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [CommonModule, NzBreadCrumbModule, RouterTestingModule.withRoutes(routes)],
        declarations: [NzBreadcrumbAutoGenerateDemoComponent, NzBreadcrumbNullComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(NzBreadcrumbAutoGenerateDemoComponent);
      breadcrumb = fixture.debugElement.query(By.directive(NzBreadCrumbComponent));

      fixture.ngZone!.run(() => {
        router = TestBed.inject(Router);
        router.initialNavigation();

        // Should generate 2 breadcrumbs when reaching out of the `data` scope.
        router.navigate(['one', 'two', 'three', 'four']);
        flushFixture(fixture);
        expect(breadcrumb.componentInstance.breadcrumbs.length).toBe(2);

        // TODO: pending this test because of Angular's bug: https://github.com/angular/angular/issues/25837
        // const items = fixture.debugElement.queryAll(By.directive(NzBreadCrumbItemComponent));
        // dispatchMouseEvent(items[1].nativeElement.querySelector('a'), 'click');
        // flushFixture(fixture);
        // expect(breadcrumb.componentInstance.breadcrumbs.length).toBe(1);

        // Should generate breadcrumbs correctly.
        router.navigate(['one', 'two', 'three']);
        flushFixture(fixture);
        expect(breadcrumb.componentInstance.breadcrumbs.length).toBe(2);
        router.navigate(['one', 'two']);
        flushFixture(fixture);
        expect(breadcrumb.componentInstance.breadcrumbs.length).toBe(1);

        // Shouldn't generate breadcrumb at all.
        router.navigate(['one']);
        flushFixture(fixture);
        expect(breadcrumb.componentInstance.breadcrumbs.length).toBe(0);

        router.navigate(['/']);
        flushFixture(fixture);
        router.navigate([{ outlets: { nonPrimary: ['one', 'two'] } }]);
        flushFixture(fixture);
        expect(router.url).toBe('/(nonPrimary:one/two)');
      });
    }));

    it('should route data breadcrumb label work', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [CommonModule, NzBreadCrumbModule, RouterTestingModule.withRoutes(customRouteLabelRoutes)],
        declarations: [NzBreadcrumbRouteLabelDemoComponent, NzBreadcrumbNullComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(NzBreadcrumbRouteLabelDemoComponent);
      breadcrumb = fixture.debugElement.query(By.directive(NzBreadCrumbComponent));

      fixture.ngZone!.run(() => {
        router = TestBed.inject(Router);
        router.initialNavigation();

        // Should nzRouteLabel value is 'customBreadcrumb'
        flushFixture(fixture);
        expect(breadcrumb.componentInstance.nzRouteLabel).toBe('customBreadcrumb');

        // Should generate 2 breadcrumbs when reaching out of the `data` scope.
        router.navigate(['one', 'two', 'three', 'four']);
        flushFixture(fixture);
        expect(breadcrumb.componentInstance.breadcrumbs.length).toBe(2);
        expect(breadcrumb.componentInstance.breadcrumbs[0].label).toBe('Layer 2');
        expect(breadcrumb.componentInstance.breadcrumbs[1].label).toBe('Layer 3');
      });
    }));

    it('should [nzRouteLabelFn] work', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [CommonModule, NzBreadCrumbModule, RouterTestingModule.withRoutes(customRouteLabelRoutes)],
        declarations: [NzBreadcrumbRouteLabelWithCustomFnDemoComponent, NzBreadcrumbNullComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(NzBreadcrumbRouteLabelWithCustomFnDemoComponent);
      breadcrumb = fixture.debugElement.query(By.directive(NzBreadCrumbComponent));

      fixture.ngZone!.run(() => {
        router = TestBed.inject(Router);
        router.initialNavigation();

        // Should nzRouteLabel value is 'customBreadcrumb'
        flushFixture(fixture);
        expect(breadcrumb.componentInstance.nzRouteLabel).toBe('customBreadcrumb');

        // Should generate 2 breadcrumbs when reaching out of the `data` scope.
        router.navigate(['one', 'two', 'three', 'four']);
        flushFixture(fixture);
        expect(breadcrumb.componentInstance.breadcrumbs.length).toBe(2);
        expect(breadcrumb.componentInstance.breadcrumbs[0].label).toBe('Layer 2 Layer 2');
        expect(breadcrumb.componentInstance.breadcrumbs[1].label).toBe('Layer 3 Layer 3');
      });
    }));

    it('should route data breadcrumb navigate work', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [CommonModule, NzBreadCrumbModule, RouterTestingModule.withRoutes(customRouteLabelRoutes)],
        declarations: [NzBreadcrumbRouteLabelDemoComponent, NzBreadcrumbNullComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(NzBreadcrumbRouteLabelDemoComponent);
      breadcrumb = fixture.debugElement.query(By.directive(NzBreadCrumbComponent));

      fixture.ngZone!.run(() => {
        router = TestBed.inject(Router);
        router.initialNavigation();

        flushFixture(fixture);
        expect(breadcrumb.componentInstance.nzRouteLabel).toBe('customBreadcrumb');

        router.navigate(['one', 'two', 'three', 'four']);
        flushFixture(fixture);

        fixture.debugElement.query(By.css('a')).nativeElement.click();
        flushFixture(fixture);
        expect(router.url).toBe('/one/two');
      });
    }));

    it('should raise error when RouterModule is not included', fakeAsync(() => {
      TestBed.configureTestingModule({
        imports: [NzBreadCrumbModule],
        declarations: [NzBreadcrumbAutoGenerateErrorDemoComponent]
      });

      expect(() => {
        TestBed.compileComponents();
        fixture = TestBed.createComponent(NzBreadcrumbAutoGenerateErrorDemoComponent);
        fixture.detectChanges();
      }).toThrowError();
    }));

    it('should call navigate() within the Angular zone', fakeAsync(() => {
      let navigateHasBeenCalledWithinTheAngularZone = false;

      TestBed.configureTestingModule({
        imports: [CommonModule, NzBreadCrumbModule, RouterTestingModule.withRoutes(customRouteLabelRoutes)],
        declarations: [NzBreadcrumbRouteLabelDemoComponent, NzBreadcrumbNullComponent]
      }).compileComponents();

      fixture = TestBed.createComponent(NzBreadcrumbRouteLabelDemoComponent);
      breadcrumb = fixture.debugElement.query(By.directive(NzBreadCrumbComponent));

      const navigate = breadcrumb.componentInstance.navigate;
      const spy = spyOn(breadcrumb.componentInstance, 'navigate').and.callFake((url: string, event: MouseEvent) => {
        navigateHasBeenCalledWithinTheAngularZone = NgZone.isInAngularZone();
        return navigate.call(breadcrumb.componentInstance, url, event);
      });

      router = TestBed.inject(Router);
      router.initialNavigation();
      flushFixture(fixture);

      router.navigate(['one', 'two']);
      flushFixture(fixture);

      fixture.debugElement.query(By.css('a')).nativeElement.click();
      flushFixture(fixture);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(navigateHasBeenCalledWithinTheAngularZone).toBeTrue();
    }));
  });

  describe('RTL', () => {
    it('should className correct on dir change', () => {
      const fixture = TestBed.createComponent(NzTestBreadcrumbRtlComponent);
      const breadcrumb = fixture.debugElement.query(By.directive(NzBreadCrumbComponent));
      fixture.detectChanges();
      expect(breadcrumb.nativeElement.classList).toContain('ant-breadcrumb-rtl');

      fixture.componentInstance.direction = 'ltr';
      fixture.detectChanges();
      expect(breadcrumb.nativeElement.className).not.toContain('ant-breadcrumb-rtl');
    });
  });
});

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
function flushFixture(fixture: ComponentFixture<any>): void {
  fixture.detectChanges();
  flush();
  fixture.detectChanges();
}

@Component({
  // eslint-disable-next-line
  selector: 'nz-test-breadcrumb',
  template: `
    <nz-breadcrumb [nzAutoGenerate]="true"></nz-breadcrumb>
    <router-outlet></router-outlet>
    <router-outlet name="nonPrimary"></router-outlet>
  `
})
class NzBreadcrumbAutoGenerateDemoComponent {}

@Component({
  template: `
    <nz-breadcrumb [nzAutoGenerate]="true" [nzRouteLabel]="'customBreadcrumb'"></nz-breadcrumb>
    <router-outlet></router-outlet>
  `
})
class NzBreadcrumbRouteLabelDemoComponent {}

@Component({
  template: `
    <nz-breadcrumb
      [nzAutoGenerate]="true"
      [nzRouteLabel]="'customBreadcrumb'"
      [nzRouteLabelFn]="labelFn"
    ></nz-breadcrumb>
    <router-outlet></router-outlet>
  `
})
class NzBreadcrumbRouteLabelWithCustomFnDemoComponent {
  labelFn = (label: string): string => (label ? `${label} ${label}` : '');
}

@Component({
  template: '<nz-breadcrumb [nzAutoGenerate]="true"></nz-breadcrumb>'
})
class NzBreadcrumbAutoGenerateErrorDemoComponent {}

@Component({
  template: 'empty'
})
class NzBreadcrumbNullComponent {}

const routes: Routes = [
  {
    path: 'one',
    component: NzBreadcrumbAutoGenerateDemoComponent,
    data: {
      breadcrumb: ''
    },
    children: [
      {
        path: 'two',
        component: NzBreadcrumbNullComponent,
        data: {
          breadcrumb: 'Layer 2'
        },
        children: [
          {
            path: 'three',
            component: NzBreadcrumbNullComponent,
            data: {
              breadcrumb: 'Layer 3'
            },
            children: [
              {
                path: 'four',
                component: NzBreadcrumbNullComponent,
                data: {
                  breadcrumb: ''
                }
              }
            ]
          }
        ]
      }
    ]
  },
  // Should only work for the primary outlet.
  {
    path: 'one',
    outlet: 'nonPrimary',
    component: NzBreadcrumbAutoGenerateDemoComponent,
    data: {
      breadcrumb: ''
    },
    children: [
      {
        path: 'two',
        component: NzBreadcrumbNullComponent,
        data: {
          breadcrumb: 'Layer 2'
        }
      }
    ]
  }
];

const customRouteLabelRoutes: Routes = [
  {
    path: 'one',
    component: NzBreadcrumbRouteLabelDemoComponent,
    data: {
      customBreadcrumb: ''
    },
    children: [
      {
        path: 'two',
        component: NzBreadcrumbNullComponent,
        data: {
          customBreadcrumb: 'Layer 2'
        },
        children: [
          {
            path: 'three',
            component: NzBreadcrumbNullComponent,
            data: {
              customBreadcrumb: 'Layer 3'
            },
            children: [
              {
                path: 'four',
                component: NzBreadcrumbNullComponent,
                data: {
                  customBreadcrumb: ''
                }
              }
            ]
          }
        ]
      }
    ]
  }
];

@Component({
  template: `
    <div [dir]="direction">
      <nz-demo-breadcrumb-basic></nz-demo-breadcrumb-basic>
    </div>
  `
})
export class NzTestBreadcrumbRtlComponent {
  @ViewChild(Dir) dir!: Dir;
  direction = 'rtl';
}
